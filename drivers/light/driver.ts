import { DEVICE_CATEGORIES, TUYA_PERCENTAGE_SCALING } from '../../lib/TuyaOAuth2Constants';
import { ListDeviceProperties } from '../../lib/TuyaOAuth2Driver';
import { constIncludes, sendSetting } from '../../lib/TuyaOAuth2Util';
import {
  type TuyaDeviceDataPointResponse,
  TuyaDeviceResponse,
  TuyaDeviceSpecificationResponse,
} from '../../types/TuyaApiTypes';
import type { StandardDeviceFlowArgs, StandardFlowArgs } from '../../types/TuyaTypes';
import type TuyaOAuth2DeviceLight from './device';
import { LIGHT_SETTING_LABELS, LightSettingCommand, PIR_CAPABILITIES } from './TuyaLightConstants';
import TuyaOAuth2DriverWithLight from '../../lib/TuyaOAuth2DriverWithLight';
import TRANSLATIONS from './translations.json';

type DeviceArgs = StandardDeviceFlowArgs<TuyaOAuth2DeviceLight>;
type FlowArgs = StandardFlowArgs<TuyaOAuth2DeviceLight>;

module.exports = class TuyaOAuth2DriverLight extends TuyaOAuth2DriverWithLight {
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

    this.homey.flow
      .getActionCard('light_switch_pir')
      .registerRunListener(async (args: FlowArgs) =>
        sendSetting(args.device, 'switch_pir', args.value, LIGHT_SETTING_LABELS),
      );

    this.homey.flow.getActionCard('light_standby_on').registerRunListener(async (args: FlowArgs) => {
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
        await sendSetting(args.device, command.code, command.value, LIGHT_SETTING_LABELS);
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
    // superclass handles light capabilities, except onoff
    const props = super.onTuyaPairListDeviceProperties(device, specifications, dataPoints);
    props.store.tuya_switches = [];

    props.store._migrations = [
      ...(props.store._migrations ?? []),
      'light_fix_undefined_specifications',
      'light_switch_capability',
      'light_switch_on_dim',
    ];

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
        props.capabilitiesOptions[homeyCapability] = TRANSLATIONS.capabilitiesOptions[homeyCapability];
      }

      if (tuyaCapability === 'switch') {
        props.store.tuya_capabilities.push(tuyaCapability);
        props.store.tuya_switches.push(tuyaCapability);
        const homeyCapability = 'onoff.switch';
        props.capabilities.push(homeyCapability);
        props.capabilitiesOptions[homeyCapability] = TRANSLATIONS.capabilitiesOptions[homeyCapability];
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
      const translations = TRANSLATIONS.capabilitiesOptions['onoff.all'];
      props.capabilitiesOptions['onoff'] = {
        ...translations,
        setOnDim: false,
        preventInsights: true,
      };
    }

    for (const status of device.status) {
      const tuyaCapability = status.code;

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

    return props;
  }
};
