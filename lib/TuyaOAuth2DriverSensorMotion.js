'use strict';

const TuyaOAuth2DriverSensor = require('./TuyaOAuth2DriverSensor');
const TuyaOAuth2Constants = require('./TuyaOAuth2Constants');

/**
 * @extends TuyaOAuth2DriverSensor
 * @hideconstructor
 */
class TuyaOAuth2DriverSensorMotion extends TuyaOAuth2DriverSensor {

  static TUYA_DEVICE_CATEGORIES = [
    TuyaOAuth2Constants.DEVICE_CATEGORIES.SECURITY_VIDEO_SURV.MOTION_SENSOR,
  ];

  onTuyaPairListDeviceProperties(device) {
    const props = super.onTuyaPairListDeviceProperties(device);

    // alarm_motion
    const hasPir = device.status.some(({ code }) => code === 'pir');
    if (hasPir) {
      props.store.tuya_capabilities.push('pir');
      props.capabilities.push('alarm_motion');
    }

    return props;
  }

}

module.exports = TuyaOAuth2DriverSensorMotion;
