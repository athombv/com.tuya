import { DEVICE_CATEGORIES } from '../../lib/TuyaOAuth2Constants';
import type TuyaOAuth2Device from '../../lib/TuyaOAuth2Device';
import TuyaOAuth2Driver, { ListDeviceProperties } from '../../lib/TuyaOAuth2Driver';
import { getFromMap } from '../../lib/TuyaOAuth2Util';
import {
  type TuyaDeviceDataPointResponse,
  TuyaDeviceResponse,
  TuyaDeviceSpecificationResponse,
} from '../../types/TuyaApiTypes';
import { AIRCO_CAPABILITIES_MAPPING } from './TuyaAircoConstants';

type DeviceArgs = { device: TuyaOAuth2Device };
type ValueArgs = { value: unknown };

module.exports = class TuyaOAuth2DriverAirco extends TuyaOAuth2Driver {
  TUYA_DEVICE_CATEGORIES = [DEVICE_CATEGORIES.LARGE_HOME_APPLIANCES.AIR_CONDITIONER] as const;

  async onInit(): Promise<void> {
    await super.onInit();

    this.homey.flow.getActionCard('heater_set_child_lock').registerRunListener(async (args: DeviceArgs & ValueArgs) => {
      await args.device.triggerCapabilityListener('child_lock', args.value);
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

      const homeyCapability = getFromMap(AIRCO_CAPABILITIES_MAPPING, tuyaCapability);
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

      if (tuyaCapability === 'humidity_set') {
        const scaleExp = values.scale ?? 0;
        const scale = 10 ** scaleExp;

        props.capabilitiesOptions['target_humidity'] = {
          step: values.step / scale,
          min: values.min / scale,
          max: values.max / scale,
        };
      }

      if (['temp_set', 'temp_current', 'humidity_set', 'humidity_current'].includes(tuyaCapability)) {
        if ([0, 1, 2, 3].includes(values.scale)) {
          props.settings[`${tuyaCapability}_scaling`] = `${values.scale}`;
        } else {
          this.error(`Unsupported ${tuyaCapability} scale:`, values.scale);
        }
      }
    }
    return props;
  }
};
