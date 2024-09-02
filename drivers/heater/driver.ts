import { DEVICE_CATEGORIES } from '../../lib/TuyaOAuth2Constants';
import TuyaOAuth2Driver, { ListDeviceProperties } from '../../lib/TuyaOAuth2Driver';
import { getFromMap } from '../../lib/TuyaOAuth2Util';
import {
  type TuyaDeviceDataPointResponse,
  TuyaDeviceResponse,
  TuyaDeviceSpecificationResponse,
} from '../../types/TuyaApiTypes';
import type { StandardFlowArgs } from '../../types/TuyaTypes';
import { DEFAULT_TUYA_HEATER_FAULTS, HEATER_CAPABILITIES_MAPPING } from './TuyaHeaterConstants';

module.exports = class TuyaOAuth2DriverHeater extends TuyaOAuth2Driver {
  TUYA_DEVICE_CATEGORIES = [
    DEVICE_CATEGORIES.SMALL_HOME_APPLIANCES.HEATER,
    DEVICE_CATEGORIES.LARGE_HOME_APPLIANCES.HEATER,
  ] as const;

  async onInit(): Promise<void> {
    await super.onInit();

    this.homey.flow.getActionCard('heater_set_child_lock').registerRunListener(async (args: StandardFlowArgs) => {
      await args.device.triggerCapabilityListener('child_lock', args.value);
    });

    this.homey.flow.getActionCard('heater_set_eco_mode').registerRunListener(async (args: StandardFlowArgs) => {
      await args.device.triggerCapabilityListener('eco_mode', args.value);
    });
  }

  onTuyaPairListDeviceProperties(
    device: TuyaDeviceResponse,
    specifications?: TuyaDeviceSpecificationResponse,
    dataPoints?: TuyaDeviceDataPointResponse,
  ): ListDeviceProperties {
    const props = super.onTuyaPairListDeviceProperties(device, specifications, dataPoints);

    for (const status of device.status) {
      const tuyaCapability = status.code;

      const homeyCapability = getFromMap(HEATER_CAPABILITIES_MAPPING, tuyaCapability);
      if (homeyCapability) {
        props.store.tuya_capabilities.push(tuyaCapability);
        props.capabilities.push(homeyCapability);
      }
    }

    if (!specifications || !specifications.status) {
      return props;
    }

    for (const spec of specifications.status) {
      const tuyaCapability = spec.code;
      const values = JSON.parse(spec.values);

      if (tuyaCapability === 'temp_set') {
        const scaleExp = values.scale ?? 0;
        const scale = 10 ** scaleExp;

        props.capabilitiesOptions['target_temperature'] = {
          step: values.step / scale,
          min: values.min / scale,
          max: values.max / scale,
        };
      }

      if (['temp_set', 'temp_current', 'work_power'].includes(tuyaCapability)) {
        if ([0, 1, 2, 3].includes(values.scale)) {
          props.settings[`${tuyaCapability}_scaling`] = `${values.scale}`;
        } else {
          this.error(`Unsupported ${tuyaCapability} scale:`, values.scale);
        }
      }

      if (tuyaCapability === 'fault') {
        this.log('Fault specs: ', values);
        props.store.tuya_heater_fault_capabilities = [...values.label];
      }
    }

    //fallback in case no fault specs are available
    if (!props.store.tuya_heater_fault_capabilities) {
      this.log('No fault specs available, using default values');
      props.store.tuya_heater_fault_capabilities = DEFAULT_TUYA_HEATER_FAULTS;
    }

    return props;
  }
};
