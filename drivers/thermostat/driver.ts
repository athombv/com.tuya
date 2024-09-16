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

    for (const status of device.status) {
      const tuyaCapability = status.code;
      const homeyCapability = getFromMap(THERMOSTAT_CAPABILITIES_MAPPING, tuyaCapability);

      if (homeyCapability) {
        props.store.tuya_capabilities.push(tuyaCapability);
        props.capabilities.push(homeyCapability);
      } else if (constIncludes(THERMOSTAT_CAPABILITIES.setting, tuyaCapability)) {
        props.store.tuya_capabilities.push(tuyaCapability);
      }
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
    }

    return props;
  }
};
