import { DEVICE_CATEGORIES } from '../../lib/TuyaOAuth2Constants';
import { ListDeviceProperties } from '../../lib/TuyaOAuth2Driver';
import TuyaOAuth2DriverSensor from '../../lib/TuyaOAuth2DriverSensor';
import {
  type TuyaDeviceDataPointResponse,
  TuyaDeviceResponse,
  TuyaDeviceSpecificationResponse,
} from '../../types/TuyaApiTypes';

module.exports = class TuyaOAuth2DriverSensorSmoke extends TuyaOAuth2DriverSensor {
  TUYA_DEVICE_CATEGORIES = [DEVICE_CATEGORIES.SECURITY_VIDEO_SURV.SMOKE_ALARM] as const;

  onTuyaPairListDeviceProperties(
    device: TuyaDeviceResponse,
    specifications?: TuyaDeviceSpecificationResponse,
    dataPoints?: TuyaDeviceDataPointResponse,
  ): ListDeviceProperties {
    const props = super.onTuyaPairListDeviceProperties(device, specifications, dataPoints);

    // alarm_smoke
    const hasSmokeSensorStatus = device.status.some(({ code }) => code === 'smoke_sensor_status');
    if (hasSmokeSensorStatus) {
      props.store.tuya_capabilities.push('smoke_sensor_status');
      props.capabilities.push('alarm_smoke');
    }

    if (!specifications || !specifications.status) {
      return props;
    }

    for (const specification of specifications.status) {
      const tuyaCapability = specification.code;
      const values = JSON.parse(specification.values);
      if (tuyaCapability === 'alarm_smoke') {
        if (!values.range.includes('normal')) {
          props.settings['use_alarm_timeout'] = true;
        }
      }
    }

    return props;
  }
};
