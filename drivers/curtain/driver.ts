import { DEVICE_CATEGORIES } from '../../lib/TuyaOAuth2Constants';
import TuyaOAuth2Driver, { ListDeviceProperties } from '../../lib/TuyaOAuth2Driver';
import { constIncludes, getFromMap } from '../../lib/TuyaOAuth2Util';
import {
  type TuyaDeviceDataPointResponse,
  TuyaDeviceResponse,
  TuyaDeviceSpecificationResponse,
} from '../../types/TuyaApiTypes';
import { CURTAIN_CAPABILITIES, CURTAIN_CAPABILITY_MAPPING } from './TuyaCurtainConstants';

module.exports = class TuyaOAuth2DriverCurtain extends TuyaOAuth2Driver {
  TUYA_DEVICE_CATEGORIES = [DEVICE_CATEGORIES.SMALL_HOME_APPLIANCES.CURTAIN] as const;

  onTuyaPairListDeviceProperties(
    device: TuyaDeviceResponse,
    specifications?: TuyaDeviceSpecificationResponse,
    dataPoints?: TuyaDeviceDataPointResponse,
  ): ListDeviceProperties {
    const props = super.onTuyaPairListDeviceProperties(device, specifications, dataPoints);

    for (const status of device.status) {
      const tuyaCapability = status.code;

      const homeyCapability = getFromMap(CURTAIN_CAPABILITY_MAPPING, tuyaCapability);
      if (constIncludes(CURTAIN_CAPABILITIES.read_write, tuyaCapability) && homeyCapability) {
        props.store.tuya_capabilities.push(tuyaCapability);
        props.capabilities.push(homeyCapability);
      }

      if (constIncludes(CURTAIN_CAPABILITIES.setting, tuyaCapability) || tuyaCapability === 'percent_state') {
        props.store.tuya_capabilities.push(tuyaCapability);
      }
    }

    return props;
  }
};
