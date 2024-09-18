import { DEVICE_CATEGORIES } from '../../lib/TuyaOAuth2Constants';
import TuyaOAuth2Driver, { ListDeviceProperties } from '../../lib/TuyaOAuth2Driver';
import {
  type TuyaDeviceDataPointResponse,
  TuyaDeviceResponse,
  TuyaDeviceSpecificationResponse,
} from '../../types/TuyaApiTypes';
import { constIncludes, getFromMap } from '../../lib/TuyaOAuth2Util';
import { THERMOSTAT_CAPABILITIES, THERMOSTAT_CAPABILITIES_MAPPING, THERMOSTAT_FLOWS } from './TuyaThermostatConstants';
import type { StandardFlowArgs } from '../../types/TuyaTypes';

function generateThermostatModeTitles(values: string[]): {
  id: string;
  title: {
    en: string;
  };
}[] {
  return values.map(value => {
    const capitalized = (value.charAt(0).toUpperCase() + value.slice(1)).replaceAll('_', ' ');
    return {
      id: value,
      title: {
        en: capitalized,
      },
    };
  });
}

module.exports = class TuyaOAuth2DriverThermostat extends TuyaOAuth2Driver {
  TUYA_DEVICE_CATEGORIES = [DEVICE_CATEGORIES.SMALL_HOME_APPLIANCES.THERMOSTAT] as const;

  async onInit(): Promise<void> {
    await super.onInit();

    for (const homeyCapability of THERMOSTAT_FLOWS.capability_action) {
      this.homey.flow.getActionCard(`thermostat_${homeyCapability}`).registerRunListener((args: StandardFlowArgs) => {
        return args.device.triggerCapabilityListener(homeyCapability, args.value);
      });
    }
  }

  onTuyaPairListDeviceProperties(
    device: TuyaDeviceResponse,
    specifications?: TuyaDeviceSpecificationResponse,
    dataPoints?: TuyaDeviceDataPointResponse,
  ): ListDeviceProperties {
    const props = super.onTuyaPairListDeviceProperties(device, specifications, dataPoints);

    let mode = false;
    let work_state = false;

    for (const status of device.status) {
      const tuyaCapability = status.code;
      const homeyCapability = getFromMap(THERMOSTAT_CAPABILITIES_MAPPING, tuyaCapability);

      if (homeyCapability) {
        props.store.tuya_capabilities.push(tuyaCapability);
        props.capabilities.push(homeyCapability);
      }

      if (constIncludes(THERMOSTAT_CAPABILITIES.setting, tuyaCapability)) {
        props.store.tuya_capabilities.push(tuyaCapability);
      }

      if (tuyaCapability === 'mode') {
        mode = true;
      }

      if (tuyaCapability === 'work_state') {
        work_state = true;
      }
    }

    if (mode) {
      work_state = false;
    }

    if (work_state) {
      props.store.tuya_capabilities.push('work_state');
      props.capabilities.push('thermostat_mode');
      const values = generateThermostatModeTitles([
        'cold',
        'hot',
        'wind',
        'comfortable',
        'energy',
        'auto',
        'holiday',
        'eco',
        'manual',
        'sleep',
        'dry',
        'program',
        'floor_heat',
        'auxiliary_heat',
      ]);

      props.capabilitiesOptions['thermostat_mode'] = {
        values: values,
        setable: false,
      };
    }

    if (!specifications || !specifications.status) {
      return props;
    }

    for (const status of specifications.status) {
      const tuyaCapability = status.code;
      const values = JSON.parse(status.values);
      const homeyCapability = getFromMap(THERMOSTAT_CAPABILITIES_MAPPING, tuyaCapability);

      if (['temp_set', 'temp_current'].includes(tuyaCapability) && homeyCapability) {
        const scaling = 10.0 ** (values.scale ?? 0);
        props.capabilitiesOptions[homeyCapability] = {
          min: (values.min ?? 5) / scaling,
          max: (values.max ?? 40) / scaling,
        };
      }

      if (['humidity', 'battery_percentage'].includes(tuyaCapability) && homeyCapability) {
        const scaling = 10.0 ** (values.scale ?? 0);
        props.capabilitiesOptions[homeyCapability] = {
          min: (values.min ?? 0) / scaling,
          max: (values.max ?? 100) / scaling,
        };
      }

      if (constIncludes(THERMOSTAT_CAPABILITIES.read_scaled, tuyaCapability) && homeyCapability) {
        if ([0, 1, 2, 3].includes(values.scale)) {
          props.settings[`${homeyCapability}_scaling`] = `${values.scale}`;
        } else {
          this.error(`Unsupported ${tuyaCapability} scale:`, values.scale);
        }
      }

      if (tuyaCapability === 'mode' || (work_state && tuyaCapability === 'work_state')) {
        if (!values.range || values.range.length === 0) {
          continue;
        }

        const modeOptions = generateThermostatModeTitles(values.range as string[]);

        props.capabilitiesOptions['thermostat_mode'] = {
          values: modeOptions,
        };
      }
    }

    return props;
  }
};
