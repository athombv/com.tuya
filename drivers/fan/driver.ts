import { DEVICE_CATEGORIES } from '../../lib/TuyaOAuth2Constants';
import { ListDeviceProperties } from '../../lib/TuyaOAuth2Driver';
import {
  type TuyaDeviceDataPointResponse,
  TuyaDeviceResponse,
  TuyaDeviceSpecificationResponse,
} from '../../types/TuyaApiTypes';
import { getFromMap } from '../../lib/TuyaOAuth2Util';
import { FAN_CAPABILITIES_MAPPING } from './TuyaFanConstants';
import TuyaOAuth2DriverWithLight from '../../lib/TuyaOAuth2DriverWithLight';

module.exports = class TuyaOAuth2DriverFan extends TuyaOAuth2DriverWithLight {
  TUYA_DEVICE_CATEGORIES = [
    DEVICE_CATEGORIES.SMALL_HOME_APPLIANCES.FAN,
    DEVICE_CATEGORIES.LIGHTING.CEILING_FAN_LIGHT,
  ] as const;

  onTuyaPairListDeviceProperties(
    device: TuyaDeviceResponse,
    specifications?: TuyaDeviceSpecificationResponse,
    dataPoints?: TuyaDeviceDataPointResponse,
  ): ListDeviceProperties {
    // superclass handles light capabilities, except onoff.light
    const props = super.onTuyaPairListDeviceProperties(device, specifications, dataPoints);

    props.store['_migrations'] = ['fan_tuya_capabilities'];

    for (const status of device.status) {
      const tuyaCapability = status.code;

      const homeyCapability = getFromMap(FAN_CAPABILITIES_MAPPING, tuyaCapability);
      if (homeyCapability) {
        props.store.tuya_capabilities.push(tuyaCapability);
        props.capabilities.push(homeyCapability);
      }

      if (tuyaCapability === 'fan_speed') {
        props.store.tuya_capabilities.push(tuyaCapability);
        if (device.category === 'fsd') {
          props.capabilities.push('dim');
        } else {
          props.capabilities.push('legacy_fan_speed');
        }
      }

      if (tuyaCapability === 'colour_data') {
        props.store.tuya_capabilities.push(tuyaCapability);
        props.capabilities.push('light_hue');
        props.capabilities.push('light_saturation');
      }
    }

    // Fix onoff when light is present
    if (props.capabilities.includes('onoff.light')) {
      props.capabilitiesOptions['onoff'] = {
        title: {
          en: `Fan`,
        },
        insightsTitleTrue: {
          en: `Turned on (Fan)`,
        },
        insightsTitleFalse: {
          en: `Turned off (Fan)`,
        },
      };

      props.capabilitiesOptions['onoff.light'] = {
        title: {
          en: `Light`,
        },
        insightsTitleTrue: {
          en: `Turned on (Light)`,
        },
        insightsTitleFalse: {
          en: `Turned off (Light)`,
        },
      };
    }

    // Fix dim when light is present
    if (props.capabilities.includes('dim.light')) {
      props.capabilitiesOptions['dim'] = {
        title: {
          en: `Fan`,
        },
      };

      props.capabilitiesOptions['dim.light'] = {
        title: {
          en: `Light`,
        },
      };
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
