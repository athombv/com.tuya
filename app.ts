import { OAuth2App } from 'homey-oauth2app';
import NodeCache from 'node-cache';
import TuyaOAuth2Client from './lib/TuyaOAuth2Client';
import * as TuyaOAuth2Util from './lib/TuyaOAuth2Util';

import TuyaOAuth2Device from './lib/TuyaOAuth2Device';
import sourceMapSupport from 'source-map-support';
import type {
  TuyaDeviceDataPoint,
  TuyaDeviceDataPointResponse,
  TuyaScene,
  TuyaStatusResponse,
} from './types/TuyaApiTypes';
import { type ArgumentAutocompleteResults } from 'homey/lib/FlowCard';

sourceMapSupport.install();

const STATUS_CACHE_KEY = 'status';
const DATAPOINT_CACHE_KEY = 'datapoint';
const SCENE_CACHE_KEY = 'scenes';
const CACHE_TTL = 30;

type DeviceArgs = { device: TuyaOAuth2Device };
type StatusCodeArgs = { code: AutoCompleteArg };
type StatusCodeState = { code: string };
type HomeyTuyaScene = Pick<TuyaScene, 'id' | 'name'>;

type AutoCompleteArg = {
  name: string;
  id: string;
  title: string;
  dataPoint: boolean;
};

module.exports = class TuyaOAuth2App extends OAuth2App {
  static OAUTH2_CLIENT = TuyaOAuth2Client;
  static OAUTH2_DEBUG = process.env.DEBUG === '1';
  static OAUTH2_MULTI_SESSION = false; // TODO: Enable this feature & make nice pairing UI

  private apiCache: NodeCache = new NodeCache({ stdTTL: CACHE_TTL });

  async onOAuth2Init(): Promise<void> {
    await super.onOAuth2Init();

    const sendCommandRunListener = async ({
      device,
      code,
      value,
    }: {
      device: TuyaOAuth2Device;
      code: AutoCompleteArg;
      value: unknown;
    }): Promise<void> => {
      if (code.dataPoint) {
        await device.setDataPoint(code.id, value);
      } else {
        await device.sendCommand({ code: code.id, value });
      }
    };

    const autocompleteListener = async (
      query: string | undefined,
      args: DeviceArgs,
      filter: ({ value }: { value: unknown }) => boolean,
    ): Promise<ArgumentAutocompleteResults> => {
      function convert(
        values: TuyaStatusResponse | Array<TuyaDeviceDataPoint>,
        dataPoints: boolean,
      ): ArgumentAutocompleteResults {
        values = values.filter(filter);

        const trimmedQuery = (query ?? '').trim();
        if (trimmedQuery) {
          values = values.filter(({ code }: { code: string }) =>
            code.toLowerCase().includes(trimmedQuery.toLowerCase()),
          );
        }

        return values.map(value => ({
          name: value.code,
          id: value.code,
          title: value.code,
          dataPoint: dataPoints,
        }));
      }

      const deviceId = args.device.getData().deviceId;
      const statusCacheKey = `${STATUS_CACHE_KEY}_${deviceId}`;
      const datapointCacheKey = `${DATAPOINT_CACHE_KEY}_${deviceId}`;

      if (!this.apiCache.has(statusCacheKey)) {
        this.apiCache.set<TuyaStatusResponse | null>(
          statusCacheKey,
          await args.device.getStatus().catch(e => {
            this.error(e);
            return null;
          }),
        );
      }

      const status = this.apiCache.get<TuyaStatusResponse | null>(statusCacheKey);
      const statusOptions = status ? convert(status, false) : [];

      if (!this.apiCache.has(datapointCacheKey)) {
        this.apiCache.set<TuyaDeviceDataPointResponse | null>(
          datapointCacheKey,
          await args.device.queryDataPoints().catch(e => {
            this.error(e);
            return null;
          }),
        );
      }

      const dataPoints = this.apiCache.get<TuyaDeviceDataPointResponse | null>(datapointCacheKey);
      const dataPointOptions = dataPoints ? convert(dataPoints.properties, true) : [];

      // Remove duplicates, preferring status options
      const combinedMap: Record<string, ArgumentAutocompleteResults[number]> = {};

      for (const dataPointOption of dataPointOptions) {
        combinedMap[dataPointOption.name] = dataPointOption;
      }

      for (const statusOption of statusOptions) {
        combinedMap[statusOption.name] = statusOption;
      }

      const possibleValues = Object.values(combinedMap);
      if (possibleValues.length === 0) {
        throw new Error(this.homey.__('error_retrieving_codes'));
      }

      return possibleValues;
    };

    // Register Tuya Web API Flow Cards
    // Sending
    this.homey.flow
      .getActionCard('send_command_string')
      .registerRunListener(sendCommandRunListener)
      .registerArgumentAutocompleteListener('code', async (query: string, args: DeviceArgs) =>
        autocompleteListener(
          query,
          args,
          ({ value }) => typeof value === 'string' && !TuyaOAuth2Util.hasJsonStructure(value),
        ),
      );

    this.homey.flow
      .getActionCard('send_command_number')
      .registerRunListener(sendCommandRunListener)
      .registerArgumentAutocompleteListener('code', async (query: string, args: DeviceArgs) =>
        autocompleteListener(query, args, ({ value }) => typeof value === 'number'),
      );

    this.homey.flow
      .getActionCard('send_command_boolean')
      .registerRunListener(sendCommandRunListener)
      .registerArgumentAutocompleteListener('code', async (query: string, args: DeviceArgs) =>
        autocompleteListener(query, args, ({ value }) => typeof value === 'boolean'),
      );

    this.homey.flow
      .getActionCard('send_command_json')
      .registerRunListener(
        async ({ device, code, value }: { device: TuyaOAuth2Device; code: string | { id: string }; value: string }) => {
          if (typeof code === 'object') code = code.id;

          await device.sendCommand({
            code,
            value: JSON.parse(value),
          });
        },
      )
      .registerArgumentAutocompleteListener('code', async (query: string, args: DeviceArgs) =>
        autocompleteListener(
          query,
          args,
          ({ value }) => typeof value === 'object' || TuyaOAuth2Util.hasJsonStructure(value),
        ),
      );

    // Receiving
    this.homey.flow
      .getDeviceTriggerCard('receive_status_boolean')
      .registerRunListener((args: StatusCodeArgs, state: StatusCodeState) => args.code.id === state.code)
      .registerArgumentAutocompleteListener('code', async (query: string, args: DeviceArgs) =>
        autocompleteListener(query, args, ({ value }) => typeof value === 'boolean'),
      );

    this.homey.flow
      .getDeviceTriggerCard('receive_status_json')
      .registerRunListener((args: StatusCodeArgs, state: StatusCodeState) => args.code.id === state.code)
      .registerArgumentAutocompleteListener('code', async (query: string, args: DeviceArgs) =>
        autocompleteListener(
          query,
          args,
          ({ value }) => typeof value === 'object' || TuyaOAuth2Util.hasJsonStructure(value),
        ),
      );

    this.homey.flow
      .getDeviceTriggerCard('receive_status_number')
      .registerRunListener((args: StatusCodeArgs, state: StatusCodeState) => args.code.id === state.code)
      .registerArgumentAutocompleteListener('code', async (query: string, args: DeviceArgs) =>
        autocompleteListener(query, args, ({ value }) => typeof value === 'number'),
      );

    this.homey.flow
      .getDeviceTriggerCard('receive_status_string')
      .registerRunListener((args: StatusCodeArgs, state: StatusCodeState) => args.code.id === state.code)
      .registerArgumentAutocompleteListener('code', async (query: string, args: DeviceArgs) =>
        autocompleteListener(
          query,
          args,
          ({ value }) => typeof value === 'string' && !TuyaOAuth2Util.hasJsonStructure(value),
        ),
      );

    // Tuya scenes
    this.homey.flow
      .getActionCard('trigger_scene')
      .registerRunListener(async (args: { scene: HomeyTuyaScene }) => {
        const { scene } = args;
        const client = this.getFirstSavedOAuth2Client();
        await client.triggerScene(scene.id);
      })
      .registerArgumentAutocompleteListener('scene', async (query?: string) => {
        if (!this.apiCache.has(SCENE_CACHE_KEY)) {
          this.log('Retrieving available scenes');
          const client = this.getFirstSavedOAuth2Client();

          // Gets all homes for this user
          const homes = await client.getHomes().catch(err => {
            this.error(err);
            throw new Error(this.homey.__('error_retrieving_scenes'));
          });

          // Get all scenes for this user's homes
          const scenes: Array<HomeyTuyaScene> = [];
          for (const home of homes) {
            await client
              .getScenes(home.home_id)
              .then(homeScenes =>
                scenes.push(
                  ...homeScenes.list.map(scene => ({
                    name: scene.name,
                    id: scene.id,
                  })),
                ),
              )
              .catch(err => {
                if (err.tuyaCode === 40001900) {
                  // Access to particular home denied, skip it
                  this.log('Scene home denied access', home.home_id);
                  return;
                }

                this.error(err);
                throw new Error(this.homey.__('error_retrieving_scenes'));
              });
          }

          this.apiCache.set(SCENE_CACHE_KEY, scenes);
        }

        const scenes = this.apiCache.get<HomeyTuyaScene[]>(SCENE_CACHE_KEY) ?? [];

        const trimmedQuery = (query ?? '').trim();
        if (!trimmedQuery) {
          return scenes;
        }

        return scenes.filter(scene => scene.name.toLowerCase().includes(trimmedQuery.toLowerCase()));
      });

    this.log('Tuya started');
  }

  getFirstSavedOAuth2Client(): TuyaOAuth2Client {
    const client = super.getFirstSavedOAuth2Client();
    if (!client) {
      throw new Error(this.homey.__('connection_failed'));
    }

    return client as TuyaOAuth2Client;
  }
};
