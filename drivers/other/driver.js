'use strict';

const TuyaOAuth2Driver = require('../../lib/TuyaOAuth2Driver');

module.exports = class TuyaOAuth2DriverOther extends TuyaOAuth2Driver {

  async onOAuth2Init() {
    await super.onOAuth2Init();

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

  onTuyaPairListDeviceFilter() {
    return true; // Accept any device
  }

};
