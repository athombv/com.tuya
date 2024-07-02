'use strict';

const { OAuth2App } = require('homey-oauth2app');
const TuyaOAuth2Client = require('./TuyaOAuth2Client');

class TuyaOAuth2App extends OAuth2App {

  static OAUTH2_CLIENT = TuyaOAuth2Client;
  static OAUTH2_DEBUG = process.env.DEBUG === '1';
  static OAUTH2_MULTI_SESSION = false; // TODO: Enable this feature & make nice pairing UI

  async onOAuth2Init() {
    await super.onOAuth2Init();

    // Register Tuya Web API Flow Cards
    this.homey.flow
      .getActionCard('send_command_string')
      .registerRunListener(async ({ device, code, value }) => {
        if (typeof code === 'object') code = code.id;

        await device.sendCommand({ code, value });
      })
      .registerArgumentAutocompleteListener('code', async (query, args) => {
        const status = await args.device.getStatus();
        return status
          .filter(({ value }) => {
            return typeof value === 'string' && !value.startsWith('{');
          })
          .filter(({ code }) => {
            return code.toLowerCase().includes(query.toLowerCase());
          })
          .map(({ code }) => ({
            id: code,
            title: code,
          }));
      });

    this.homey.flow
      .getActionCard('send_command_number')
      .registerRunListener(async ({ device, code, value }) => {
        if (typeof code === 'object') code = code.id;

        await device.sendCommand({ code, value });
      })
      .registerArgumentAutocompleteListener('code', async (query, args) => {
        const status = await args.device.getStatus();
        return status
          .filter(({ value }) => {
            return typeof value === 'number';
          })
          .filter(({ code }) => {
            return code.toLowerCase().includes(query.toLowerCase());
          })
          .map(({ code }) => ({
            id: code,
            title: code,
          }));
      });

    this.homey.flow
      .getActionCard('send_command_boolean')
      .registerRunListener(async ({ device, code, value }) => {
        if (typeof code === 'object') code = code.id;

        await device.sendCommand({ code, value });
      })
      .registerArgumentAutocompleteListener('code', async (query, args) => {
        const status = await args.device.getStatus();
        return status
          .filter(({ value }) => {
            return typeof value === 'boolean';
          })
          .filter(({ code }) => {
            return code.toLowerCase().includes(query.toLowerCase());
          })
          .map(({ code }) => ({
            id: code,
            title: code,
          }));
      });

    this.homey.flow
      .getActionCard('send_command_json')
      .registerRunListener(async ({ device, code, value }) => {
        if (typeof code === 'object') code = code.id;

        await device.sendCommand({
          code,
          value: JSON.parse(value),
        });
      })
      .registerArgumentAutocompleteListener('code', async (query, args) => {
        const status = await args.device.getStatus();
        return status
          .filter(({ value }) => {
            return typeof value === 'string' && value.startsWith('{');
          })
          .filter(({ code }) => {
            return code.toLowerCase().includes(query.toLowerCase());
          })
          .map(({ code }) => ({
            id: code,
            title: code,
          }));
      });
  }

}

module.exports = TuyaOAuth2App;
