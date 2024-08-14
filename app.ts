'use strict';

import {OAuth2App} from 'homey-oauth2app';
import TuyaOAuth2Client from './lib/TuyaOAuth2Client';
import * as TuyaOAuth2Util from './lib/TuyaOAuth2Util';

import TuyaOAuth2Device from "./lib/TuyaOAuth2Device";
import sourceMapSupport from 'source-map-support';
import {TuyaScene} from "./types/TuyaApiTypes";
import { ArgumentAutocompleteResults } from 'homey/lib/FlowCard';

sourceMapSupport.install();

class TuyaOAuth2App extends OAuth2App {
  static OAUTH2_CLIENT = TuyaOAuth2Client;
  static OAUTH2_DEBUG = process.env.DEBUG === '1';
  static OAUTH2_MULTI_SESSION = false; // TODO: Enable this feature & make nice pairing UI

  async onOAuth2Init() {
    await super.onOAuth2Init();

    const sendCommandRunListener = async ({device, code, value}: {
      device: TuyaOAuth2Device,
      code: string | { id: string },
      value: unknown
    }) => {
      if (typeof code === 'object') code = code.id;
      await device.sendCommand({ code, value });
    };

    const generalControlAutocompleteListener = async (query: string, args: {
      device: TuyaOAuth2Device
    }, filter: ({value}: { value: unknown }) => boolean): Promise<ArgumentAutocompleteResults> => {
      const status = await args.device.getStatus();
      return status
        .filter(filter)
        .filter(({code}: { code: string }) => {
          return code.toLowerCase().includes(query.toLowerCase());
        })
        .map(({code}: { code: string }) => ({
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
      .registerArgumentAutocompleteListener('code', async (query: string, args: { device: TuyaOAuth2Device }) =>
        generalControlAutocompleteListener(query, args, ({ value }) => typeof value === 'string' && !TuyaOAuth2Util.hasJsonStructure(value)),
      );

    this.homey.flow
      .getActionCard('send_command_number')
      .registerRunListener(sendCommandRunListener)
      .registerArgumentAutocompleteListener('code', async (query: string, args: { device: TuyaOAuth2Device }) =>
        generalControlAutocompleteListener(query, args, ({ value }) => typeof value === 'number'),
      );

    this.homey.flow
      .getActionCard('send_command_boolean')
      .registerRunListener(sendCommandRunListener)
      .registerArgumentAutocompleteListener('code', async (query: string, args: { device: TuyaOAuth2Device }) =>
        generalControlAutocompleteListener(query, args, ({ value }) => typeof value === 'boolean'),
      );

    this.homey.flow
      .getActionCard('send_command_json')
      .registerRunListener(async ({ device, code, value }: {
        device: TuyaOAuth2Device,
        code: string | { id: string },
        value: string,
      }) => {
        if (typeof code === 'object') code = code.id;

        await device.sendCommand({
          code,
          value: JSON.parse(value),
        });
      })
      .registerArgumentAutocompleteListener('code', async (query: string, args: { device: TuyaOAuth2Device }) =>
        generalControlAutocompleteListener(query, args, ({ value }) => typeof value === 'object' || TuyaOAuth2Util.hasJsonStructure(value)),
      );

    // Receiving
    this.homey.flow
      .getDeviceTriggerCard('receive_status_boolean')
      .registerRunListener((args: { code: { id: string }; }, state: { code: any }) => args.code.id === state.code)
      .registerArgumentAutocompleteListener('code', async (query: string, args: { device: TuyaOAuth2Device }) =>
        generalControlAutocompleteListener(query, args, ({ value }) => typeof value === 'boolean'),
      );

    this.homey.flow
      .getDeviceTriggerCard('receive_status_json')
      .registerRunListener((args: { code: { id: string }; }, state: { code: any }) => args.code.id === state.code)
      .registerArgumentAutocompleteListener('code', async (query: string, args: { device: TuyaOAuth2Device }) =>
        generalControlAutocompleteListener(query, args, ({ value }) => typeof value === 'object' || TuyaOAuth2Util.hasJsonStructure(value)),
      );

    this.homey.flow
      .getDeviceTriggerCard('receive_status_number')
      .registerRunListener((args: { code: { id: string }; }, state: { code: any }) => args.code.id === state.code)
      .registerArgumentAutocompleteListener('code', async (query: string, args: { device: TuyaOAuth2Device }) =>
        generalControlAutocompleteListener(query, args, ({ value }) => typeof value === 'number'),
      );

    this.homey.flow
      .getDeviceTriggerCard('receive_status_string')
      .registerRunListener((args: { code: { id: string } }, state: { code: any }) => args.code.id === state.code)
      .registerArgumentAutocompleteListener('code', async (query: string, args: { device: TuyaOAuth2Device }) =>
        generalControlAutocompleteListener(query, args, ({ value }) => typeof value === 'string' && !TuyaOAuth2Util.hasJsonStructure(value)),
      );

    // Tuya scenes
    this.homey.flow
      .getActionCard("trigger_scene")
      .registerRunListener(async (args: { scene: { name: string, id: string }}) => {
        const {scene} = args;
        const client = this.getFirstSavedOAuth2Client();
        await client.triggerScene(scene.id);
      })
      .registerArgumentAutocompleteListener("scene", async () => {
        const client = this.getFirstSavedOAuth2Client();

        // Gets all homes for this user
        const homes = await client.getHomes().catch((err: Error) => {
          this.error(err);
          throw new Error(this.homey.__("error_retrieving_scenes"));
        });

        // Get all scenes for this user's homes
        let scenes: TuyaScene[] = [];
        for (const home of homes) {
          const homeScenes = await client.getScenes(home.home_id)
              .catch((err: Error) => {
                this.error(err);
                throw new Error(this.homey.__("error_retrieving_scenes"));
              });
          scenes = scenes.concat(homeScenes.list);
        }

        return scenes.map(scene => ({
          name: scene.name,
          id: scene.id,
        }));
      });

    this.log('Tuya started');
  }

  getFirstSavedOAuth2Client(): TuyaOAuth2Client {
    return super.getFirstSavedOAuth2Client() as TuyaOAuth2Client;
  }
}

module.exports = TuyaOAuth2App;
