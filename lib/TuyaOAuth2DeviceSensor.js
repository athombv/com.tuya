'use strict';

const TuyaOAuth2Device = require('./TuyaOAuth2Device');

/**
 * Device Class for Tuya Sensors. Adds `alarm_battery` capability if present.
 * @extends TuyaOAuth2Device
 * @hideconstructor
 */
class TuyaOAuth2DeviceSensor extends TuyaOAuth2Device {

  async onTuyaStatus(status) {
    await super.onTuyaStatus(status);

    // alarm_battery
    if (typeof status['battery_state'] === 'string') {
      this.setCapabilityValue('alarm_battery', status['battery_state'] === 'low').catch(this.error);
    }
  }

}

module.exports = TuyaOAuth2DeviceSensor;
