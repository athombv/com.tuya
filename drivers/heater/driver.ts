import { DEVICE_CATEGORIES } from '../../lib/TuyaOAuth2Constants';
import type TuyaOAuth2Device from '../../lib/TuyaOAuth2Device';
import TuyaOAuth2Driver, { ListDeviceProperties } from '../../lib/TuyaOAuth2Driver';
import {
  type TuyaDeviceDataPointResponse,
  TuyaDeviceResponse,
  TuyaDeviceSpecificationResponse,
} from '../../types/TuyaApiTypes';
import { HEATER_CAPABILITIES_MAPPING } from './TuyaHeaterConstants';

type DeviceArgs = { device: TuyaOAuth2Device };
type ValueArgs = { value: unknown };

module.exports = class TuyaOAuth2DriverHeater extends TuyaOAuth2Driver {
  TUYA_DEVICE_CATEGORIES = [DEVICE_CATEGORIES.SMALL_HOME_APPLIANCES.HEATER] as const;

  async onInit(): Promise<void> {
    await super.onInit();

    this.homey.flow.getActionCard('heater_set_child_lock').registerRunListener(async (args: DeviceArgs & ValueArgs) => {
      await args.device.triggerCapabilityListener('child_lock', args.value);
    });

    this.homey.flow.getActionCard('heater_set_eco_mode').registerRunListener(async (args: DeviceArgs & ValueArgs) => {
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

      if (tuyaCapability in HEATER_CAPABILITIES_MAPPING) {
        props.store.tuya_capabilities.push(tuyaCapability);

        const homeyCapability = HEATER_CAPABILITIES_MAPPING[tuyaCapability as keyof typeof HEATER_CAPABILITIES_MAPPING];
        props.capabilities.push(homeyCapability);
      }
    }

    if (!specifications || !specifications.functions) {
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
        if ([0, 1, 2].includes(values.scale)) {
          props.settings[`${tuyaCapability}_scaling`] = `${values.scale}`;
        } else {
          this.error(`Unsupported ${tuyaCapability} scale:`, values.scale);
        }
      }
    }

    return props;
  }
};
