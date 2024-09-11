import { DEVICE_CATEGORIES } from '../../lib/TuyaOAuth2Constants';
import TuyaOAuth2Driver, { ListDeviceProperties } from '../../lib/TuyaOAuth2Driver';
import { constIncludes, getFromMap } from '../../lib/TuyaOAuth2Util';
import {
  type TuyaDeviceDataPointResponse,
  TuyaDeviceResponse,
  TuyaDeviceSpecificationResponse,
} from '../../types/TuyaApiTypes';
import {
  CIRCUIT_BREAKER_CAPABILITIES,
  CIRCUIT_BREAKER_CAPABILITIES_MAPPING,
  CIRCUIT_BREAKER_SETTING_LABELS,
} from './TuyaCircuitBreakerConstants';

module.exports = class TuyaOAuth2DriverCircuitBreaker extends TuyaOAuth2Driver {
  TUYA_DEVICE_CATEGORIES = [DEVICE_CATEGORIES.ENERGY.CIRCUIT_BREAKER] as const;

  async onInit(): Promise<void> {
    await super.onInit();

    this.addSettingFlowHandler('child_lock', CIRCUIT_BREAKER_SETTING_LABELS);
  }

  onTuyaPairListDeviceProperties(
    device: TuyaDeviceResponse,
    specifications?: TuyaDeviceSpecificationResponse,
    dataPoints?: TuyaDeviceDataPointResponse,
  ): ListDeviceProperties {
    const props = super.onTuyaPairListDeviceProperties(device, specifications, dataPoints);

    for (const status of device.status) {
      const tuyaCapability = status.code;

      const homeyCapability = getFromMap(CIRCUIT_BREAKER_CAPABILITIES_MAPPING, tuyaCapability);
      if (homeyCapability) {
        props.store.tuya_capabilities.push(tuyaCapability);
        props.capabilities.push(homeyCapability);
      }

      if (constIncludes(CIRCUIT_BREAKER_CAPABILITIES.setting, tuyaCapability)) {
        props.store.tuya_capabilities.push(tuyaCapability);
      }
    }

    if (!specifications || !specifications.status) {
      return props;
    }

    for (const specification of specifications.status) {
      const tuyaCapability = specification.code;
      const values = JSON.parse(specification.values);
      const homeyCapability = getFromMap(CIRCUIT_BREAKER_CAPABILITIES_MAPPING, tuyaCapability);

      if (constIncludes(CIRCUIT_BREAKER_CAPABILITIES.read_only_scaled, tuyaCapability) && homeyCapability) {
        const setting = `${homeyCapability}_scaling`;
        if ([0, 1, 2, 3].includes(values.scale)) {
          props.settings[setting] = `${values.scale}`;
        } else {
          this.error(`Unsupported ${setting}:`, values.scale);
        }
      }
    }

    return props;
  }
};
