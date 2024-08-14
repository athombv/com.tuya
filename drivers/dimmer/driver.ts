import { DEVICE_CATEGORIES, TUYA_PERCENTAGE_SCALING } from '../../lib/TuyaOAuth2Constants';
import TuyaOAuth2Driver, { ListDeviceProperties } from '../../lib/TuyaOAuth2Driver';
import { constIncludes } from '../../lib/TuyaOAuth2Util';
import { TuyaDeviceResponse, TuyaDeviceSpecificationResponse } from '../../types/TuyaApiTypes';
import TuyaOAuth2DeviceDimmer from './device';
import { SIMPLE_DIMMER_CAPABILITIES } from './TuyaDimmerConstants';

type DeviceArgs = { device: TuyaOAuth2DeviceDimmer };
type ValueArgs = { value: unknown };

module.exports = class TuyaOAuth2DriverDimmer extends TuyaOAuth2Driver {
  TUYA_DEVICE_CATEGORIES = [DEVICE_CATEGORIES.LIGHTING.DIMMER] as const;

  async onInit(): Promise<void> {
    await super.onInit();

    for (let switch_i = 1; switch_i <= 2; switch_i++) {
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

      this.homey.flow
        .getActionCard(`dimmer_channel_${switch_i}_dim`)
        .registerRunListener(async (args: DeviceArgs & ValueArgs) => {
          await args.device.singleDim(args.value as number, `bright_value_${switch_i}`);
        });
    }
  }

  onTuyaPairListDeviceProperties(
    device: TuyaDeviceResponse,
    specification: TuyaDeviceSpecificationResponse,
  ): ListDeviceProperties {
    const props = super.onTuyaPairListDeviceProperties(device, specification);
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

      if (tuyaCapability === 'switch_led_1' || tuyaCapability === 'switch_led_2') {
        props.store.tuya_switches.push(tuyaCapability);
      }

      if (tuyaCapability === 'bright_value_1' || tuyaCapability === 'bright_value_2') {
        props.store.tuya_dimmers.push(tuyaCapability);
      }
    }

    // On/Off
    if (props.store.tuya_switches.length > 0) {
      props.capabilities.push('onoff');
    }

    if (props.store.tuya_switches.length === 2) {
      for (let switch_i = 1; switch_i <= 2; switch_i++) {
        const subSwitchCapability = `onoff.${switch_i}`;
        props.capabilities.push(subSwitchCapability);
        props.capabilitiesOptions[subSwitchCapability] = {
          title: {
            en: `Switch ${switch_i}`,
          },
          insightsTitleTrue: {
            en: `Turned on (Switch ${switch_i})`,
          },
          insightsTitleFalse: {
            en: `Turned off (Switch ${switch_i})`,
          },
        };
      }

      props.capabilitiesOptions['onoff'] = {
        title: {
          en: 'Switch All',
        },
        preventInsights: true,
      };
    }

    // Dim
    if (props.store.tuya_dimmers.length === 1) {
      props.capabilities.push('dim');
    }

    if (props.store.tuya_dimmers.length === 2) {
      for (let switch_i = 1; switch_i <= 2; switch_i++) {
        const subSwitchCapability = `dim.${switch_i}`;
        props.capabilities.push(subSwitchCapability);
        props.capabilitiesOptions[subSwitchCapability] = {
          title: {
            en: `Dim ${switch_i}`,
          },
          preventInsights: true,
        };
      }
    }

    if (!specification || !specification.status) {
      return props;
    }

    for (const statusSpecification of specification.status) {
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
    }

    return props;
  }
};
