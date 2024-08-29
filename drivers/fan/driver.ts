import { DEVICE_CATEGORIES } from '../../lib/TuyaOAuth2Constants';
import TuyaOAuth2Driver, { ListDeviceProperties } from '../../lib/TuyaOAuth2Driver';
import {
  type TuyaDeviceDataPointResponse,
  TuyaDeviceResponse,
  TuyaDeviceSpecificationResponse,
} from '../../types/TuyaApiTypes';
import { getFromMap } from '../../lib/TuyaOAuth2Util';
import { FAN_CAPABILITIES_MAPPING } from './TuyaFanConstants';

module.exports = class TuyaOAuth2DriverFan extends TuyaOAuth2Driver {
  TUYA_DEVICE_CATEGORIES = [DEVICE_CATEGORIES.SMALL_HOME_APPLIANCES.FAN] as const;

  onTuyaPairListDeviceProperties(
    device: TuyaDeviceResponse,
    specifications?: TuyaDeviceSpecificationResponse,
    dataPoints?: TuyaDeviceDataPointResponse,
  ): ListDeviceProperties {
    const props = super.onTuyaPairListDeviceProperties(device, specifications, dataPoints);

    props.store['_migrations'] = ['fan_tuya_capabilities'];

    for (const status of device.status) {
      const tuyaCapability = status.code;

      const homeyCapability = getFromMap(FAN_CAPABILITIES_MAPPING, tuyaCapability);
      if (homeyCapability) {
        props.store.tuya_capabilities.push(tuyaCapability);
        props.capabilities.push(homeyCapability);
      }
    }

    if (!specifications) {
      return props;
    }

    for (const statusSpecification of specifications.status) {
      const tuyaCapability = statusSpecification.code;
      const values = JSON.parse(statusSpecification.values);

      // Fan
      if (tuyaCapability === 'fan_speed_percent') {
        props.capabilitiesOptions['dim'] = {
          min: values.min ?? 1,
          max: values.max ?? 100,
          step: values.step ?? 0,
        };
      }

      if (tuyaCapability === 'fan_speed') {
        const legacyFanSpeedsEnum = [];
        for (let i = values.range.length; i >= 1; i--) {
          legacyFanSpeedsEnum.push({
            id: `${i}`,
            title: `${i}`,
          });
        }
        props.capabilitiesOptions['legacy_fan_speed'] = {
          values: legacyFanSpeedsEnum,
        };
      }

      // Temperature
      if (tuyaCapability === 'temp') {
        props.capabilitiesOptions['target_temperature'] = {
          min: values.min ?? 0,
          max: values.max ?? 50,
        };
      }
      if (tuyaCapability === 'temp_current') {
        props.capabilitiesOptions['measure_temperature'] = {
          min: values.min ?? 0,
          max: values.max ?? 50,
        };
      }
    }

    return props;
  }
};
