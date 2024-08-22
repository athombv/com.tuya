import { OAuth2App } from 'homey-oauth2app';
import NodeCache from 'node-cache';
import TuyaOAuth2Client from './lib/TuyaOAuth2Client';
import * as TuyaOAuth2Util from './lib/TuyaOAuth2Util';

import TuyaOAuth2Device from './lib/TuyaOAuth2Device';
import sourceMapSupport from 'source-map-support';
import { type TuyaScene } from './types/TuyaApiTypes';
import { type ArgumentAutocompleteResults } from 'homey/lib/FlowCard';

sourceMapSupport.install();

const CACHE_KEY = 'scenes';
const CACHE_TTL = 30;

type DeviceArgs = { device: TuyaOAuth2Device };
type StatusCodeArgs = { code: { id: string } };
type StatusCodeState = { code: string };
type HomeyTuyaScene = Pick<TuyaScene, 'id' | 'name'>;

module.exports = class TuyaOAuth2App extends OAuth2App {
  static OAUTH2_CLIENT = TuyaOAuth2Client;
  static OAUTH2_DEBUG = process.env.DEBUG === '1';
  static OAUTH2_MULTI_SESSION = false; // TODO: Enable this feature & make nice pairing UI

  private sceneCache: NodeCache = new NodeCache({ stdTTL: CACHE_TTL });

  async onOAuth2Init(): Promise<void> {
    await super.onOAuth2Init();

    const sendCommandRunListener = async ({
      device,
      code,
      value,
    }: {
      device: TuyaOAuth2Device;
      code: string | { id: string };
      value: unknown;
    }): Promise<void> => {
      if (typeof code === 'object') code = code.id;
      await device.sendCommand({ code, value });
    };

    const generalControlAutocompleteListener = async (
      query: string,
      args: DeviceArgs,
      filter: ({ value }: { value: unknown }) => boolean,
    ): Promise<ArgumentAutocompleteResults> => {
      const status = await args.device.getStatus();
      return status
        .filter(filter)
        .filter(({ code }: { code: string }) => {
          return code.toLowerCase().includes(query.toLowerCase());
        })
        .map(({ code }: { code: string }) => ({
          name: code,
          id: code,
          title: code,
        }));
    };

    // Register Tuya Web API Flow Cards
    // Sending
    this.homey.flow
      .getActionCard('send_command_string')
      .registerRunListener(sendCommandRunListener)
      .registerArgumentAutocompleteListener('code', async (query: string, args: DeviceArgs) =>
        generalControlAutocompleteListener(
          query,
          args,
          ({ value }) => typeof value === 'string' && !TuyaOAuth2Util.hasJsonStructure(value),
        ),
      );

    this.homey.flow
      .getActionCard('send_command_number')
      .registerRunListener(sendCommandRunListener)
      .registerArgumentAutocompleteListener('code', async (query: string, args: DeviceArgs) =>
        generalControlAutocompleteListener(query, args, ({ value }) => typeof value === 'number'),
      );

    this.homey.flow
      .getActionCard('send_command_boolean')
      .registerRunListener(sendCommandRunListener)
      .registerArgumentAutocompleteListener('code', async (query: string, args: DeviceArgs) =>
        generalControlAutocompleteListener(query, args, ({ value }) => typeof value === 'boolean'),
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
        generalControlAutocompleteListener(
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
        generalControlAutocompleteListener(query, args, ({ value }) => typeof value === 'boolean'),
      );

    this.homey.flow
      .getDeviceTriggerCard('receive_status_json')
      .registerRunListener((args: StatusCodeArgs, state: StatusCodeState) => args.code.id === state.code)
      .registerArgumentAutocompleteListener('code', async (query: string, args: DeviceArgs) =>
        generalControlAutocompleteListener(
          query,
          args,
          ({ value }) => typeof value === 'object' || TuyaOAuth2Util.hasJsonStructure(value),
        ),
      );

    this.homey.flow
      .getDeviceTriggerCard('receive_status_number')
      .registerRunListener((args: StatusCodeArgs, state: StatusCodeState) => args.code.id === state.code)
      .registerArgumentAutocompleteListener('code', async (query: string, args: DeviceArgs) =>
        generalControlAutocompleteListener(query, args, ({ value }) => typeof value === 'number'),
      );

    this.homey.flow
      .getDeviceTriggerCard('receive_status_string')
      .registerRunListener((args: StatusCodeArgs, state: StatusCodeState) => args.code.id === state.code)
      .registerArgumentAutocompleteListener('code', async (query: string, args: DeviceArgs) =>
        generalControlAutocompleteListener(
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
      .registerArgumentAutocompleteListener('scene', async (query: string) => {
        if (!this.sceneCache.has(CACHE_KEY)) {
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

          this.sceneCache.set(CACHE_KEY, scenes);
        }
        return (this.sceneCache.get<HomeyTuyaScene[]>(CACHE_KEY) ?? []).filter(scene =>
          scene.name.toLowerCase().includes(query.toLowerCase()),
        );
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
