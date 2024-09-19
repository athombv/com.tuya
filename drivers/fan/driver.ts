import { DEVICE_CATEGORIES } from '../../lib/TuyaOAuth2Constants';
import { ListDeviceProperties } from '../../lib/TuyaOAuth2Driver';
import {
  type TuyaDeviceDataPointResponse,
  TuyaDeviceResponse,
  TuyaDeviceSpecificationResponse,
} from '../../types/TuyaApiTypes';
import { getFromMap } from '../../lib/TuyaOAuth2Util';
import { FAN_CAPABILITIES_MAPPING, FAN_SETTING_LABELS } from './TuyaFanConstants';
import TuyaOAuth2DriverWithLight from '../../lib/TuyaOAuth2DriverWithLight';
import { StandardDeviceFlowArgs, StandardFlowArgs } from '../../types/TuyaTypes';
import TRANSLATIONS from './translations.json';

module.exports = class TuyaOAuth2DriverFan extends TuyaOAuth2DriverWithLight {
  TUYA_DEVICE_CATEGORIES = [
    DEVICE_CATEGORIES.SMALL_HOME_APPLIANCES.FAN,
    DEVICE_CATEGORIES.LIGHTING.CEILING_FAN_LIGHT,
  ] as const;

  async onInit(): Promise<void> {
    await super.onInit();

    this.homey.flow.getActionCard('fan_light_on').registerRunListener(async (args: StandardDeviceFlowArgs) => {
      await args.device.triggerCapabilityListener('onoff.light', true).catch(args.device.error);
    });

    this.homey.flow.getActionCard('fan_light_off').registerRunListener(async (args: StandardDeviceFlowArgs) => {
      await args.device.triggerCapabilityListener('onoff.light', false).catch(args.device.error);
    });

    this.homey.flow.getActionCard('fan_light_dim').registerRunListener(async (args: StandardFlowArgs) => {
      await args.device.triggerCapabilityListener('dim.light', args.value).catch(args.device.error);
    });

    this.homey.flow.getConditionCard('fan_light_is_on').registerRunListener((args: StandardDeviceFlowArgs) => {
      return args.device.getCapabilityValue('onoff.light').catch(args.device.error);
    });

    this.addSettingFlowHandler('fan_direction', FAN_SETTING_LABELS);
  }

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
      props.capabilitiesOptions['onoff'] = TRANSLATIONS.capabilitiesOptions['onoff.fan'];
      props.capabilitiesOptions['onoff.light'] = TRANSLATIONS.capabilitiesOptions['onoff.light'];
    }

    // Fix dim when light is present
    if (props.capabilities.includes('dim.light')) {
      props.capabilitiesOptions['dim'] = TRANSLATIONS.capabilitiesOptions['dim.fan'];
      props.capabilitiesOptions['dim.light'] = TRANSLATIONS.capabilitiesOptions['dim.light'];
    }

    if (!specifications || !specifications.status) {
      return props;
    }

    for (const statusSpecification of specifications.status) {
      const tuyaCapability = statusSpecification.code;
      const values: Record<string, unknown> = JSON.parse(statusSpecification.values);

      // Fan
      if (tuyaCapability === 'fan_speed_percent') {
        props.capabilitiesOptions['dim'] = {
          min: values.min ?? 1,
          max: values.max ?? 100,
          step: values.step ?? 1,
        };
      }

      const speeds = values.range as string[] | undefined;

      if (tuyaCapability === 'fan_speed' && speeds) {
        const legacyFanSpeedsEnum = speeds.map(value => ({
          id: value,
          title: value,
        }));
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
