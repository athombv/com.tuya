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

  onTuyaPairListDeviceProperties(device, specifications) {
    const props = super.onTuyaPairListDeviceProperties(device);

    // onoff
    const hasSwitchLed = device.status.some(({ code }) => code === 'switch_led');
    if (hasSwitchLed) {
      props.store.tuya_capabilities.push('switch_led');
      props.capabilities.push('onoff');
    }

    // dim
    const hasBrightValue = device.status.some(({ code }) => code === 'bright_value');
    if (hasBrightValue) {
      props.store.tuya_capabilities.push('bright_value');
      props.capabilities.push('dim');
    }

    const hasBrightValueV2 = device.status.some(({ code }) => code === 'bright_value_v2');
    if (hasBrightValueV2) {
      props.store.tuya_capabilities.push('bright_value_v2');
      props.capabilities.push('dim');
    }

    // light_temperature
    const hasTemperatureValue = device.status.some(({ code }) => code === 'temp_value');
    if (hasTemperatureValue) {
      props.store.tuya_capabilities.push('temp_value');
      props.capabilities.push('light_temperature');
    }

    const hasTemperatureValueV2 = device.status.some(({ code }) => code === 'temp_value_v2');
    if (hasTemperatureValueV2) {
      props.store.tuya_capabilities.push('temp_value_v2');
      props.capabilities.push('light_temperature');
    }

    // light_hue + light_saturation
    const hasColourData = device.status.some(({ code }) => code === 'colour_data');
    if (hasColourData) {
      props.store.tuya_capabilities.push('colour_data');
      props.capabilities.push('light_hue');
      props.capabilities.push('light_saturation');
    }

    const hasColourDataV2 = device.status.some(({ code }) => code === 'colour_data_v2');
    if (hasColourDataV2) {
      props.store.tuya_capabilities.push('colour_data_v2');
      props.capabilities.push('light_hue');
      props.capabilities.push('light_saturation');
    }

    // light_mode
    const hasWorkMode = device.status.some(({ code }) => code === 'work_mode');
    if (hasWorkMode) {
      props.store.tuya_capabilities.push('work_mode');
      props.capabilities.push('light_mode');
    }

    // Specifications
    for (const functionSpecification of specifications.functions) {
      const tuyaCapability = functionSpecification.code;
      const values = JSON.parse(functionSpecification.values);

      if (tuyaCapability === 'bright_value') {
        props.store.tuya_brightness = values;
      } else if (tuyaCapability === 'bright_value_v2') {
        props.store.tuya_brightness_v2 = values;
      } else if (tuyaCapability === 'temp_value') {
        props.store.tuya_temperature = values;
      } else if (tuyaCapability === 'temp_value_v2') {
        props.store.tuya_temperature_v2 = values;
      } else if (tuyaCapability === 'colour_data') {
        props.store.tuya_colour = values;
      } else if (tuyaCapability === 'colour_data_v2') {
        props.store.tuya_colour_v2 = values;
      }
    }

    return props;
  }

}

module.exports = TuyaOAuth2DriverLight;
