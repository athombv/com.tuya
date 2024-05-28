'use strict';

const TuyaOAuth2DeviceSensor = require('./TuyaOAuth2DeviceSensor');

/**
 * Device Class for Tuya Contact Sensors
 * @extends TuyaOAuth2DeviceSensor
 * @hideconstructor
 */
class TuyaOAuth2DeviceSensorContact extends TuyaOAuth2DeviceSensor {

  async onTuyaStatus(status) {
    await super.onTuyaStatus(status);

    // alarm_contact
    if (typeof status['doorcontact_state'] === 'boolean') {
      this.setCapabilityValue('alarm_contact', status['doorcontact_state']).catch(this.error);
    }
  }

}

module.exports = TuyaOAuth2DeviceSensorContact;
