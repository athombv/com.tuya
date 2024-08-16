import { DEVICE_CATEGORIES, TUYA_PERCENTAGE_SCALING } from '../../lib/TuyaOAuth2Constants';
import TuyaOAuth2Driver, { ListDeviceProperties } from '../../lib/TuyaOAuth2Driver';
import { constIncludes } from '../../lib/TuyaOAuth2Util';
import {
  type TuyaDeviceDataPointResponse,
  TuyaDeviceResponse,
  TuyaDeviceSpecificationResponse,
} from '../../types/TuyaApiTypes';
import type TuyaOAuth2DeviceLight from './device';
import { LightSettingCommand, PIR_CAPABILITIES } from './TuyaLightConstants';

type DeviceArgs = { device: TuyaOAuth2DeviceLight };
type ValueArgs = { value: unknown };

module.exports = class TuyaOAuth2DriverLight extends TuyaOAuth2Driver {
  TUYA_DEVICE_CATEGORIES = [
    DEVICE_CATEGORIES.LIGHTING.LIGHT,
    DEVICE_CATEGORIES.LIGHTING.CEILING_LIGHT,
    DEVICE_CATEGORIES.LIGHTING.AMBIENCE_LIGHT,
    DEVICE_CATEGORIES.LIGHTING.STRING_LIGHT,
    DEVICE_CATEGORIES.LIGHTING.STRIP_LIGHT,
    DEVICE_CATEGORIES.LIGHTING.MOTION_SENS_LIGHT,
    DEVICE_CATEGORIES.LIGHTING.CEILING_FAN_LIGHT,
    DEVICE_CATEGORIES.LIGHTING.SOLAR_LIGHT,
    // TODO
  ] as const;

  async onInit(): Promise<void> {
    await super.onInit();

    this.homey.flow.getActionCard('light_switch_pir').registerRunListener(async (args: DeviceArgs & ValueArgs) => {
      await args.device.sendSettingCommand({
        code: 'switch_pir',
        value: args.value as boolean,
      });
    });

    this.homey.flow.getActionCard('light_standby_on').registerRunListener(async (args: DeviceArgs & ValueArgs) => {
      const device = args.device;
      const hasStandbyOn = device.store.tuya_capabilities.includes('standby_on');
      const standbyOn = args.value as boolean;
      const standbyBrightness = device.getSetting('standby_bright');
      let commands: LightSettingCommand[];

      if (!hasStandbyOn) {
        commands = [
          {
            code: 'standby_bright',
            value: standbyOn ? standbyBrightness * TUYA_PERCENTAGE_SCALING : 0,
          },
        ];
      } else {
        commands = [
          {
            code: 'standby_bright',
            value: standbyBrightness * TUYA_PERCENTAGE_SCALING,
          },
          {
            code: 'standby_on',
            value: standbyOn,
          },
        ];
      }

      for (const command of commands) {
        await args.device.sendSettingCommand(command);
      }
    });

    // Flows for onoff.switch_led and onoff.switch
    for (const tuyaSwitch of ['switch_led', 'switch']) {
      this.homey.flow.getActionCard(`light_${tuyaSwitch}_on`).registerRunListener((args: DeviceArgs) => {
        return args.device.triggerCapabilityListener(`onoff.${tuyaSwitch}`, true);
      });

      this.homey.flow.getActionCard(`light_${tuyaSwitch}_off`).registerRunListener((args: DeviceArgs) => {
        return args.device.triggerCapabilityListener(`onoff.${tuyaSwitch}`, false);
      });

      this.homey.flow.getConditionCard(`light_${tuyaSwitch}_is_on`).registerRunListener((args: DeviceArgs) => {
        return args.device.getCapabilityValue(`onoff.${tuyaSwitch}`);
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

    // Add this before the sub-capabilities, so it becomes the quick toggle
    props.capabilities.push('onoff');

    // onoff
    for (const status of device.status) {
      const tuyaCapability = status.code;

      if (tuyaCapability === 'switch_led') {
        props.store.tuya_switches.push(tuyaCapability);
        props.store.tuya_capabilities.push(tuyaCapability);
        const homeyCapability = 'onoff.switch_led';
        props.capabilities.push(homeyCapability);

        props.capabilitiesOptions[homeyCapability] = {
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

      if (tuyaCapability === 'switch') {
        props.store.tuya_capabilities.push(tuyaCapability);
        props.store.tuya_switches.push(tuyaCapability);
        const homeyCapability = 'onoff.switch';
        props.capabilities.push(homeyCapability);

        props.capabilitiesOptions[homeyCapability] = {
          title: {
            en: `Other`,
          },
          insightsTitleTrue: {
            en: `Turned on (Other)`,
          },
          insightsTitleFalse: {
            en: `Turned off (Other)`,
          },
        };
      }
    }

    const switchCount = props.store.tuya_switches.length;

    if (switchCount === 0) {
      // Remove the 'onoff' capability
      props.capabilities.pop();
    } else if (switchCount === 1) {
      // Remove the sub-capability in favor of the regular 'onoff' capability
      props.capabilities.pop();
    } else {
      props.capabilitiesOptions['onoff'] = {
        title: {
          en: 'Switch All',
        },
        preventInsights: true,
      };
    }

    for (const status of device.status) {
      const tuyaCapability = status.code;

      // dim
      if (tuyaCapability === 'bright_value' || tuyaCapability === 'bright_value_v2') {
        props.store.tuya_capabilities.push(tuyaCapability);
        props.capabilities.push('dim');
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
        props.capabilities.push('dim');
      }

      // light_mode
      if (tuyaCapability === 'work_mode') {
        props.store.tuya_capabilities.push(tuyaCapability);
      }

      // motion alarm
      if (tuyaCapability === 'pir_state') {
        props.store.tuya_capabilities.push(tuyaCapability);
        props.capabilities.push('alarm_motion');
      }

      // motion alarm settings
      if (constIncludes(PIR_CAPABILITIES.setting, tuyaCapability)) {
        props.store.tuya_capabilities.push(tuyaCapability);
      }

      // standby settings
      if (tuyaCapability === 'standby_on' || tuyaCapability === 'standby_bright') {
        // Turn standby light on/off // Change standby brightness
        props.store.tuya_capabilities.push(tuyaCapability);
      }
    }

    // Remove duplicate capabilities
    props.capabilities = [...new Set(props.capabilities)];

    // Only add light mode capability when both temperature and colour data is available
    if (props.capabilities.includes('light_temperature') && props.capabilities.includes('light_hue')) {
      props.capabilities.push('light_mode');
    }

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
};
