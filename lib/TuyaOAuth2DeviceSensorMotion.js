'use strict';

const TuyaOAuth2DeviceSensor = require('./TuyaOAuth2DeviceSensor');

/**
 * Device Class for Tuya Motion Sensors
 * @extends TuyaOAuth2DeviceSensor
 * @hideconstructor
 */
class TuyaOAuth2DeviceSensorMotion extends TuyaOAuth2DeviceSensor {

  async onTuyaStatus(status) {
    await super.onTuyaStatus(status);

    // alarm_motion
    if (typeof status['pir'] === 'string') {
      this.setCapabilityValue('alarm_motion', status['pir'] === 'pir').catch(this.error);
    }
  }

}

module.exports = TuyaOAuth2DeviceSensorMotion;
