'use strict';

const TuyaOAuth2DriverSensor = require('./TuyaOAuth2DriverSensor');
const TuyaOAuth2Constants = require('./TuyaOAuth2Constants');

/**
 * @extends TuyaOAuth2DriverSensor
 * @hideconstructor
 */
class TuyaOAuth2DriverSensorSmoke extends TuyaOAuth2DriverSensor {

  static TUYA_DEVICE_CATEGORIES = [
    TuyaOAuth2Constants.DEVICE_CATEGORIES.SECURITY_VIDEO_SURV.SMOKE_ALARM,
  ];

  onTuyaPairListDeviceCapabilities(device) {
    const capabilities = super.onTuyaPairListDeviceCapabilities(device);

    // alarm_smoke
    const hasSmokeSensorStatus = device.status.some(({ code }) => code === 'smoke_sensor_status');
    if (hasSmokeSensorStatus) {
      capabilities.push('alarm_smoke');
    }

    return capabilities;
  }

}

module.exports = TuyaOAuth2DriverSensorSmoke;
