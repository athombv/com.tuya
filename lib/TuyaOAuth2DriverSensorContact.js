'use strict';

const TuyaOAuth2DriverSensor = require('./TuyaOAuth2DriverSensor');
const TuyaOAuth2Constants = require('./TuyaOAuth2Constants');

/**
 * @extends TuyaOAuth2DriverSensor
 * @hideconstructor
 */
class TuyaOAuth2DriverSensorContact extends TuyaOAuth2DriverSensor {

  static TUYA_DEVICE_CATEGORIES = [
    TuyaOAuth2Constants.DEVICE_CATEGORIES.SECURITY_VIDEO_SURV.CONTACT_SENSOR,
  ];

  onTuyaPairListDeviceProperties(device) {
    const props = super.onTuyaPairListDeviceProperties(device);

    // alarm_contact
    const hasDoorContactState = device.status.some(({ code }) => code === 'doorcontact_state');
    if (hasDoorContactState) {
      props.store.tuya_capabilities.push('doorcontact_state');
      props.capabilities.push('alarm_contact');
    }

    return props;
  }

}

module.exports = TuyaOAuth2DriverSensorContact;
