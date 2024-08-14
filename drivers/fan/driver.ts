import { DEVICE_CATEGORIES } from '../../lib/TuyaOAuth2Constants';
import TuyaOAuth2Driver, { ListDeviceProperties } from '../../lib/TuyaOAuth2Driver';
import { TuyaDeviceResponse, TuyaDeviceSpecificationResponse } from '../../types/TuyaApiTypes';

module.exports = class TuyaOAuth2DriverFan extends TuyaOAuth2Driver {
  TUYA_DEVICE_CATEGORIES = [
    DEVICE_CATEGORIES.SMALL_HOME_APPLIANCES.FAN,
    // TODO
  ] as const;

  onTuyaPairListDeviceProperties(
    device: TuyaDeviceResponse,
    specifications: TuyaDeviceSpecificationResponse,
  ): ListDeviceProperties {
    const props = super.onTuyaPairListDeviceProperties(device, specifications);

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
        step: 1,
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
        };
      }
    }

    return props;
  }
};
