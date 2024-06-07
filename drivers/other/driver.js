'use strict';

const TuyaOAuth2Driver = require('../../lib/TuyaOAuth2Driver');

module.exports = class TuyaOAuth2DriverOther extends TuyaOAuth2Driver {

  async onOAuth2Init() {
    await super.onOAuth2Init();

    this.homey.flow
      .getActionCard('send_command_string')
      .registerRunListener(async ({ device, code, value }) => {
        await device.sendCommand({ code, value });
      });

    this.homey.flow
      .getActionCard('send_command_number')
      .registerRunListener(async ({ device, code, value }) => {
        await device.sendCommand({ code, value });
      });

    this.homey.flow
      .getActionCard('send_command_boolean')
      .registerRunListener(async ({ device, code, value }) => {
        await device.sendCommand({ code, value });
      });
  }

  onTuyaPairListDeviceFilter() {
    return true; // Accept any device
  }

};
