'use strict';

const TuyaOAuth2DeviceSensor = require('./TuyaOAuth2DeviceSensor');

/**
 * Device Class for Tuya Smoke Sensors
 * @extends TuyaOAuth2DeviceSensor
 * @hideconstructor
 */
class TuyaOAuth2DeviceSensorSmoke extends TuyaOAuth2DeviceSensor {

  async onTuyaStatus(status) {
    await super.onTuyaStatus(status);

    // alarm_smoke
    if (typeof status['smoke_sensor_status'] === 'string') {
      this.setCapabilityValue('alarm_smoke', status['smoke_sensor_status'] === 'alarm').catch(this.error);
    }
  }

}

module.exports = TuyaOAuth2DeviceSensorSmoke;
