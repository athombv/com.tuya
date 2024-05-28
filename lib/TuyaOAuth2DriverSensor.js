'use strict';

const TuyaOAuth2Driver = require('./TuyaOAuth2Driver');

/**
 * @extends TuyaOAuth2Driver
 * @hideconstructor
 */
class TuyaOAuth2DriverSensor extends TuyaOAuth2Driver {

  onTuyaPairListDeviceCapabilities(device) {
    const capabilities = super.onTuyaPairListDeviceCapabilities(device);

    // alarm_battery
    const hasBatteryState = device.status.some(({ code }) => code === 'battery_state');
    if (hasBatteryState) {
      capabilities.push('alarm_battery');
    }

    return capabilities;
  }

}

module.exports = TuyaOAuth2DriverSensor;
