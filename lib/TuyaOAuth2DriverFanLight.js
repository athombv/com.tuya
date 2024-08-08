'use strict';

const TuyaOAuth2Driver = require('./TuyaOAuth2Driver');
const TuyaOAuth2Constants = require('./TuyaOAuth2Constants');

/**
 * @extends TuyaOAuth2Driver
 * @hideconstructor
 */
class TuyaOAuth2DriverFanLight extends TuyaOAuth2Driver {

  static TUYA_DEVICE_CATEGORIES = [
    TuyaOAuth2Constants.DEVICE_CATEGORIES.SMALL_HOME_APPLIANCES.FAN,
    // TODO
  ];

  onTuyaPairListDeviceProperties(device) {
    const props = super.onTuyaPairListDeviceProperties(device);

    // onoff
    const hasLight = device.status.some(({ code }) => code === 'light');
    if (hasLight) {
      props.capabilities.push('onoff');
    }

    // dim
    const hasBrightValue = device.status.some(({ code }) => code === 'bright_value');
    if (hasBrightValue) {
      props.capabilities.push('dim');
      props.capabilitiesOptions = props.capabilitiesOptions ?? {};
      props.capabilitiesOptions['dim'] = {
        max: 1,
        max: 100,
        step: 1
      };
    }

    // volume_mute (TBC fan_onoff)
    const hasSwitch = device.status.some(({ code }) => code === 'switch');
    if (hasSwitch) {
      props.capabilities.push('volume_mute');
    }

    // volume_set (TBC fan_set)
    const hasFanSpeedPercent = device.status.some(({ code }) => code === 'fan_speed_percent');
    if (hasFanSpeedPercent) {
      props.capabilities.push('volume_set');
      props.capabilitiesOptions = props.capabilitiesOptions ?? {};
      props.capabilitiesOptions['volume_set'] = {
        max: 1,
        max: 6,
        step: 1
      };
    }

    return props;
  }

}

module.exports = TuyaOAuth2DriverFanLight;
