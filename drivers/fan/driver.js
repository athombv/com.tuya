'use strict';

const TuyaOAuth2Driver = require('../../lib/TuyaOAuth2Driver');
const TuyaOAuth2Constants = require('../../lib/TuyaOAuth2Constants');

/**
 * @extends TuyaOAuth2Driver
 * @hideconstructor
 */
class TuyaOAuth2DriverFan extends TuyaOAuth2Driver {

  TUYA_DEVICE_CATEGORIES = [
    TuyaOAuth2Constants.DEVICE_CATEGORIES.SMALL_HOME_APPLIANCES.FAN,
    // TODO
  ];

  onTuyaPairListDeviceProperties(device, specifications) {
    const props = super.onTuyaPairListDeviceProperties(device);

    // onoff
    const hasSwitch = device.status.some(({ code }) => code === 'switch');
    if (hasSwitch) {
      props.capabilities.push('onoff');
    }

    // dim
    const hasFanSpeedPercent = device.status.some(({ code }) => code === 'fan_speed_percent');
    if (hasFanSpeedPercent) {
      props.capabilities.push('dim');
      props.capabilitiesOptions['dim'] = {
        min: 1,
        max: 6,
        step: 1
      };
    }

    if (!specifications || !specifications.functions) {
      return props;
    }

    // Device Specifications
    for (const functionSpecification of specifications.functions) {
      const tuyaCapability = functionSpecification.code;
      const values = JSON.parse(functionSpecification.values);

      if (tuyaCapability === 'fan_speed_percent') {
        props.store.tuya_brightness = values;
        props.capabilitiesOptions['dim'] = {
          min: values.min ?? 1,
          max: values.max ?? 100,
          step: values.step ?? 1,
        }
      }
    }

    return props;
  }

}

module.exports = TuyaOAuth2DriverFan;
