import { DEVICE_CATEGORIES, TUYA_PERCENTAGE_SCALING } from '../../lib/TuyaOAuth2Constants';
import TuyaOAuth2Driver, { ListDeviceProperties } from '../../lib/TuyaOAuth2Driver';
import { constIncludes, fillTranslatableObject } from '../../lib/TuyaOAuth2Util';
import {
  type TuyaDeviceDataPointResponse,
  TuyaDeviceResponse,
  TuyaDeviceSpecificationResponse,
} from '../../types/TuyaApiTypes';
import type { StandardDeviceFlowArgs, StandardFlowArgs } from '../../types/TuyaTypes';
import TuyaOAuth2DeviceDimmer from './device';
import { SIMPLE_DIMMER_CAPABILITIES } from './TuyaDimmerConstants';
import TRANSLATIONS from './translations.json';

type DeviceArgs = StandardDeviceFlowArgs<TuyaOAuth2DeviceDimmer>;
type FlowArgs = StandardFlowArgs<TuyaOAuth2DeviceDimmer>;

module.exports = class TuyaOAuth2DriverDimmer extends TuyaOAuth2Driver {
  TUYA_DEVICE_CATEGORIES = [
    DEVICE_CATEGORIES.LIGHTING.DIMMER,
    DEVICE_CATEGORIES.ELECTRICAL_PRODUCTS.DIMMER_SWITCH,
  ] as const;

  async onInit(): Promise<void> {
    await super.onInit();

    for (let switch_i = 1; switch_i <= 3; switch_i++) {
      this.homey.flow
        .getConditionCard(`dimmer_sub_switch_${switch_i}_is_on`)
        .registerRunListener((args: DeviceArgs) => {
          return args.device.getCapabilityValue(`onoff.${switch_i}`);
        });

      this.homey.flow
        .getActionCard(`dimmer_sub_switch_${switch_i}_off`)
        .registerRunListener(async (args: DeviceArgs) => {
          await args.device.singleOnOff(false, `switch_led_${switch_i}`);
        });

      this.homey.flow
        .getActionCard(`dimmer_sub_switch_${switch_i}_on`)
        .registerRunListener(async (args: DeviceArgs) => {
          await args.device.singleOnOff(true, `switch_led_${switch_i}`);
        });

      this.homey.flow.getActionCard(`dimmer_channel_${switch_i}_dim`).registerRunListener(async (args: FlowArgs) => {
        await args.device.singleDim(args.value as number, `bright_value_${switch_i}`);
      });
    }
  }

  onTuyaPairListDeviceProperties(
    device: TuyaDeviceResponse,
    specifications?: TuyaDeviceSpecificationResponse,
    dataPoints?: TuyaDeviceDataPointResponse,
  ): ListDeviceProperties {
    const props = super.onTuyaPairListDeviceProperties(device, specifications, dataPoints);
    props.store.tuya_switches = [];
    props.store.tuya_dimmers = [];

    for (const status of device.status) {
      const tuyaCapability = status.code;

      if (
        constIncludes(SIMPLE_DIMMER_CAPABILITIES.read_write, tuyaCapability) ||
        constIncludes(SIMPLE_DIMMER_CAPABILITIES.setting, tuyaCapability)
      ) {
        props.store.tuya_capabilities.push(tuyaCapability);
      }

      if (tuyaCapability === 'switch_led_1' || tuyaCapability === 'switch_led_2' || tuyaCapability === 'switch_led_3') {
        props.store.tuya_switches.push(tuyaCapability);
      }

      if (
        tuyaCapability === 'bright_value_1' ||
        tuyaCapability === 'bright_value_2' ||
        tuyaCapability === 'bright_value_3'
      ) {
        props.store.tuya_dimmers.push(tuyaCapability);
      }
    }

    // On/Off
    if (props.store.tuya_switches.length > 0) {
      props.capabilities.push('onoff');
    }

    if (props.store.tuya_switches.length > 1) {
      for (let switch_i = 1; switch_i <= 3; switch_i++) {
        const subSwitchCapability = `onoff.${switch_i}`;
        props.capabilities.push(subSwitchCapability);
        props.capabilitiesOptions[subSwitchCapability] = fillTranslatableObject(
          TRANSLATIONS.capabilitiesOptions['onoff.subSwitch'],
          { index: `${switch_i}` },
        );
      }

      props.capabilitiesOptions['onoff'] = {
        ...TRANSLATIONS.capabilitiesOptions['onoff.all'],
        preventInsights: true,
      };
    }

    // Dim
    if (props.store.tuya_dimmers.length === 1) {
      props.capabilities.push('dim');
    }

    if (props.store.tuya_dimmers.length > 1) {
      for (let switch_i = 1; switch_i <= 3; switch_i++) {
        const subSwitchCapability = `dim.${switch_i}`;
        props.capabilities.push(subSwitchCapability);
        const translations = fillTranslatableObject(TRANSLATIONS.capabilitiesOptions['dim.subSwitch'], {
          index: `${switch_i}`,
        });
        props.capabilitiesOptions[subSwitchCapability] = {
          ...translations,
          preventInsights: true,
        };
      }
    }

    if (!specifications || !specifications.status) {
      return props;
    }

    for (const statusSpecification of specifications.status) {
      const tuyaCapability = statusSpecification.code;
      const values = JSON.parse(statusSpecification.values);

      if (tuyaCapability === 'bright_value_1') {
        props.settings['brightness_min_1'] = values.min / TUYA_PERCENTAGE_SCALING;
        props.settings['brightness_max_1'] = values.max / TUYA_PERCENTAGE_SCALING;
      }

      if (tuyaCapability === 'bright_value_2') {
        props.settings['brightness_min_2'] = values.min / TUYA_PERCENTAGE_SCALING;
        props.settings['brightness_max_2'] = values.max / TUYA_PERCENTAGE_SCALING;
      }

      if (tuyaCapability === 'bright_value_3') {
        props.settings['brightness_min_3'] = values.min / TUYA_PERCENTAGE_SCALING;
        props.settings['brightness_max_3'] = values.max / TUYA_PERCENTAGE_SCALING;
      }
    }

    return props;
  }
};
