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

  onTuyaPairListDeviceCapabilities(device) {
    const capabilities = super.onTuyaPairListDeviceCapabilities(device);

    // alarm_motion
    const hasPir = device.status.some(({ code }) => code === 'pir');
    if (hasPir) {
      capabilities.push('alarm_motion');
    }

    return capabilities;
  }

}

module.exports = TuyaOAuth2DriverSensorMotion;
