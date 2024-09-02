import TuyaOAuth2Driver, { ListDeviceProperties } from './TuyaOAuth2Driver';
import {
  TuyaDeviceDataPointResponse,
  TuyaDeviceResponse,
  TuyaDeviceSpecificationResponse,
} from '../types/TuyaApiTypes';

/**
 * Handles all light-related capabilities, except onoff
 */
export default class TuyaOAuth2DriverWithLight extends TuyaOAuth2Driver {
  LIGHT_DIM_CAPABILITY = 'dim';

  onTuyaPairListDeviceProperties(
    device: TuyaDeviceResponse,
    specifications?: TuyaDeviceSpecificationResponse,
    dataPoints?: TuyaDeviceDataPointResponse,
  ): ListDeviceProperties {
    const props = super.onTuyaPairListDeviceProperties(device, specifications, dataPoints);

    for (const status of device.status) {
      const tuyaCapability = status.code;

      // dim
      if (tuyaCapability === 'bright_value' || tuyaCapability === 'bright_value_v2') {
        props.store.tuya_capabilities.push(tuyaCapability);
        props.capabilities.push(this.LIGHT_DIM_CAPABILITY);
      }

      // light temperature
      if (tuyaCapability === 'temp_value' || tuyaCapability === 'temp_value_v2') {
        props.store.tuya_capabilities.push(tuyaCapability);
        props.capabilities.push('light_temperature');
      }

      // light hue and saturation
      if (tuyaCapability === 'colour_data' || tuyaCapability === 'colour_data_v2') {
        props.store.tuya_capabilities.push(tuyaCapability);
        props.capabilities.push('light_hue');
        props.capabilities.push('light_saturation');
        props.capabilities.push(this.LIGHT_DIM_CAPABILITY);
      }

      // light_mode
      if (tuyaCapability === 'work_mode') {
        props.store.tuya_capabilities.push(tuyaCapability);
      }
    }

    // Only add light mode capability when both temperature and colour data is available
    if (props.capabilities.includes('light_temperature') && props.capabilities.includes('light_hue')) {
      props.capabilities.push('light_mode');
    }

    // Remove duplicate capabilities
    props.capabilities = [...new Set(props.capabilities)];

    // Category Specifications
    // The main light category has both (0,255) and (0,1000) for backwards compatibility
    // Other categories use only (0,1000)
    if (device.category === 'dj') {
      props.store.tuya_brightness = { min: 25, max: 255, scale: 0, step: 1 };
      props.store.tuya_temperature = { min: 0, max: 255, scale: 0, step: 1 };
      props.store.tuya_colour = {
        h: { min: 0, max: 360, scale: 0, step: 1 },
        s: { min: 0, max: 255, scale: 0, step: 1 },
        v: { min: 0, max: 255, scale: 0, step: 1 },
      };
      props.store.tuya_brightness_v2 = { min: 10, max: 1000, scale: 0, step: 1 };
      props.store.tuya_temperature_v2 = { min: 0, max: 1000, scale: 0, step: 1 };
      props.store.tuya_colour_v2 = {
        h: { min: 0, max: 360, scale: 0, step: 1 },
        s: { min: 0, max: 1000, scale: 0, step: 1 },
        v: { min: 0, max: 1000, scale: 0, step: 1 },
      };
    } else {
      props.store.tuya_brightness = { min: 10, max: 1000, scale: 0, step: 1 };
      props.store.tuya_temperature = { min: 0, max: 1000, scale: 0, step: 1 };
      props.store.tuya_colour = {
        h: { min: 0, max: 360, scale: 0, step: 1 },
        s: { min: 0, max: 1000, scale: 0, step: 1 },
        v: { min: 0, max: 1000, scale: 0, step: 1 },
      };
    }

    if (!specifications || !specifications.functions) {
      return props;
    }

    // Device Specifications
    for (const functionSpecification of specifications.functions) {
      const tuyaCapability = functionSpecification.code;
      const values = JSON.parse(functionSpecification.values);

      if (tuyaCapability === 'bright_value') {
        props.store.tuya_brightness = { ...props.store.tuya_brightness, ...values };
      } else if (tuyaCapability === 'bright_value_v2') {
        props.store.tuya_brightness_v2 = { ...props.store.tuya_brightness_v2, ...values };
      } else if (tuyaCapability === 'temp_value') {
        props.store.tuya_temperature = { ...props.store.tuya_temperature, ...values };
      } else if (tuyaCapability === 'temp_value_v2') {
        props.store.tuya_temperature_v2 = { ...props.store.tuya_temperature_v2, ...values };
      } else if (tuyaCapability === 'colour_data') {
        for (const index of ['h', 's', 'v']) {
          props.store.tuya_colour[index] = {
            ...props.store.tuya_colour[index],
            ...values?.[index],
          };
        }
      } else if (tuyaCapability === 'colour_data_v2') {
        for (const index of ['h', 's', 'v']) {
          props.store.tuya_colour_v2[index] = {
            ...props.store.tuya_colour_v2[index],
            ...values?.[index],
          };
        }
      }
    }

    return props;
  }
}
