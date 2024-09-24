import { DEVICE_CATEGORIES } from '../../lib/TuyaOAuth2Constants';
import { ListDeviceProperties } from '../../lib/TuyaOAuth2Driver';
import TuyaOAuth2DriverSensor from '../../lib/sensor/TuyaOAuth2DriverSensor';
import {
  type TuyaDeviceDataPointResponse,
  TuyaDeviceResponse,
  TuyaDeviceSpecificationResponse,
} from '../../types/TuyaApiTypes';
import { getFromMap } from '../../lib/TuyaOAuth2Util';
import { SENSOR_CO2_CAPABILITY_MAPPING } from './SensorCo2Constants';

module.exports = class TuyaOAuth2DriverSensorCO2 extends TuyaOAuth2DriverSensor {
  TUYA_DEVICE_CATEGORIES = [DEVICE_CATEGORIES.SECURITY_VIDEO_SURV.CO2_DETECTOR] as const;

  onTuyaPairListDeviceProperties(
    device: TuyaDeviceResponse,
    specifications?: TuyaDeviceSpecificationResponse,
    dataPoints?: TuyaDeviceDataPointResponse,
  ): ListDeviceProperties {
    const props = super.onTuyaPairListDeviceProperties(device, specifications, dataPoints);

    for (const status of device.status) {
      const tuyaCapability = status.code;
      const homeyCapability = getFromMap(SENSOR_CO2_CAPABILITY_MAPPING, tuyaCapability);

      if (homeyCapability) {
        props.store.tuya_capabilities.push(tuyaCapability);
        props.capabilities.push(homeyCapability);
      }
    }

    if (!specifications || !specifications.status) {
      return props;
    }

    for (const specification of specifications.status) {
      const tuyaCapability = specification.code;
      const values = JSON.parse(specification.values);
      if (tuyaCapability === 'co2_state') {
        if (!values.range.includes('normal')) {
          props.settings['use_alarm_timeout'] = true;
        }
      }
    }

    return props;
  }
};
