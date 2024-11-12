import { DEVICE_CATEGORIES } from '../../lib/TuyaOAuth2Constants';
import { ListDeviceProperties } from '../../lib/TuyaOAuth2Driver';
import TuyaOAuth2DriverSensor from '../../lib/sensor/TuyaOAuth2DriverSensor';
import {
  type TuyaDeviceDataPointResponse,
  TuyaDeviceResponse,
  TuyaDeviceSpecificationResponse,
} from '../../types/TuyaApiTypes';

module.exports = class TuyaOAuth2DriverSensorVibration extends TuyaOAuth2DriverSensor {
  TUYA_DEVICE_CATEGORIES = [DEVICE_CATEGORIES.SECURITY_VIDEO_SURV.VIBRATION_SENSOR] as const;

  onTuyaPairListDeviceProperties(
    device: TuyaDeviceResponse,
    specifications?: TuyaDeviceSpecificationResponse,
    dataPoints?: TuyaDeviceDataPointResponse,
  ): ListDeviceProperties {
    const props = super.onTuyaPairListDeviceProperties(device, specifications, dataPoints);

    for (const status of device.status) {
      const tuyaCapability = status.code;

      if (tuyaCapability === 'shock_state') {
        props.store.tuya_capabilities.push(tuyaCapability);
        props.capabilities.push('alarm_vibration');
      }
    }

    if (!specifications || !specifications.status) {
      return props;
    }

    for (const specification of specifications.status) {
      const tuyaCapability = specification.code;
      const values = JSON.parse(specification.values);
      if (tuyaCapability === 'shock_state') {
        if (!values.range.includes('normal')) {
          props.settings['use_alarm_timeout'] = true;
        }
      }
    }

    return props;
  }
};
