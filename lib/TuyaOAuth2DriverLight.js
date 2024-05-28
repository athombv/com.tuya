'use strict';

const TuyaOAuth2Driver = require('./TuyaOAuth2Driver');
const TuyaOAuth2Constants = require('./TuyaOAuth2Constants');

/**
 * @extends TuyaOAuth2Driver
 * @hideconstructor
 */
class TuyaOAuth2DriverLight extends TuyaOAuth2Driver {

  static TUYA_DEVICE_CATEGORIES = [
    TuyaOAuth2Constants.DEVICE_CATEGORIES.LIGHTING.LIGHT,
    TuyaOAuth2Constants.DEVICE_CATEGORIES.LIGHTING.CEILING_LIGHT,
    TuyaOAuth2Constants.DEVICE_CATEGORIES.LIGHTING.AMBIENCE_LIGHT,
    TuyaOAuth2Constants.DEVICE_CATEGORIES.LIGHTING.STRING_LIGHT,
    TuyaOAuth2Constants.DEVICE_CATEGORIES.LIGHTING.STRIP_LIGHT,
    TuyaOAuth2Constants.DEVICE_CATEGORIES.LIGHTING.MOTION_SENS_LIGHT,
    TuyaOAuth2Constants.DEVICE_CATEGORIES.LIGHTING.CEILING_FAN_LIGHT,
    TuyaOAuth2Constants.DEVICE_CATEGORIES.LIGHTING.SOLAR_LIGHT,
    // TODO
  ];

  onTuyaPairListDeviceCapabilities(device) {
    const capabilities = [];

    // onoff
    const hasSwitchLed = device.status.some(({ code }) => code === 'switch_led');
    if (hasSwitchLed) {
      capabilities.push('onoff');
    }

    // dim
    const hasBrightValueV2 = device.status.some(({ code }) => code === 'bright_value_v2');
    if (hasBrightValueV2) {
      capabilities.push('dim');
    }

    // light_temperature
    const hasTemperatureValueV2 = device.status.some(({ code }) => code === 'temp_value_v2');
    if (hasTemperatureValueV2) {
      capabilities.push('light_temperature');
    }

    // light_hue
    const hasColourDataV2 = device.status.some(({ code }) => code === 'colour_data_v2');
    if (hasColourDataV2) {
      capabilities.push('light_hue');
      capabilities.push('light_saturation');
    }

    // light_mode
    const hasWorkMode = device.status.some(({ code }) => code === 'work_mode');
    if (hasWorkMode) {
      capabilities.push('light_mode');
    }

    return capabilities;
  }

}

module.exports = TuyaOAuth2DriverLight;
