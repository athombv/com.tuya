import { DEVICE_CATEGORIES } from '../../lib/TuyaOAuth2Constants';
import TuyaOAuth2Driver, { type ListDeviceProperties } from '../../lib/TuyaOAuth2Driver';
import {
  type TuyaDeviceDataPointResponse,
  TuyaDeviceResponse,
  TuyaDeviceSpecificationResponse,
} from '../../types/TuyaApiTypes';
import { constIncludes, getFromMap } from '../../lib/TuyaOAuth2Util';
import { IRRIGATOR_CAPABILITIES, IRRIGATOR_CAPABILITIES_MAPPING } from './TuyaIrrigatorConstants';
import type { StandardDeviceFlowArgs } from '../../types/TuyaTypes';

module.exports = class TuyaOAuth2DriverIrrigator extends TuyaOAuth2Driver {
  TUYA_DEVICE_CATEGORIES = [DEVICE_CATEGORIES.SMALL_HOME_APPLIANCES.IRRIGATOR, 'sfkzq'] as const;

  async onInit(): Promise<void> {
    await super.onInit();

    this.homey.flow
      .getConditionCard('irrigator_rain_sensor_is_true')
      .registerRunListener((args: StandardDeviceFlowArgs) => args.device.getCapabilityValue('rain_sensor'));
  }

  onTuyaPairListDeviceProperties(
    device: TuyaDeviceResponse,
    specifications?: TuyaDeviceSpecificationResponse,
    dataPoints?: TuyaDeviceDataPointResponse,
  ): ListDeviceProperties {
    const props = super.onTuyaPairListDeviceProperties(device, specifications, dataPoints);

    for (const status of device.status) {
      const tuyaCapability = status.code;

      const homeyCapability = getFromMap(IRRIGATOR_CAPABILITIES_MAPPING, tuyaCapability);
      if (homeyCapability) {
        props.store.tuya_capabilities.push(tuyaCapability);
        props.capabilities.push(homeyCapability);
      }
    }

    if (!specifications || !specifications.status) {
      return props;
    }

    for (const status of specifications.status) {
      const tuyaCapability = status.code;
      const values = JSON.parse(status.values);

      const homeyCapability = getFromMap(IRRIGATOR_CAPABILITIES_MAPPING, tuyaCapability);

      if (constIncludes(IRRIGATOR_CAPABILITIES.read_only_scaled, tuyaCapability)) {
        if ([0, 1, 2, 3].includes(values.scale)) {
          props.settings[`${homeyCapability}_scaling`] = `${values.scale}`;
        } else {
          this.error(`Unsupported ${homeyCapability} scale:`, values.scale);
        }
      }
    }

    return props;
  }
};
