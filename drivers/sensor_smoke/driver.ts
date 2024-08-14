import TuyaOAuth2DriverSensor from '../../lib/TuyaOAuth2DriverSensor';
import { TuyaDeviceResponse, TuyaDeviceSpecificationResponse } from '../../types/TuyaApiTypes';
import { DEVICE_CATEGORIES } from '../../lib/TuyaOAuth2Constants';

module.exports = class TuyaOAuth2DriverSensorSmoke extends TuyaOAuth2DriverSensor {
  TUYA_DEVICE_CATEGORIES = [DEVICE_CATEGORIES.SECURITY_VIDEO_SURV.SMOKE_ALARM] as const;

  onTuyaPairListDeviceProperties(device: TuyaDeviceResponse, specifications: TuyaDeviceSpecificationResponse) {
    const props = super.onTuyaPairListDeviceProperties(device, specifications);

    // alarm_smoke
    const hasSmokeSensorStatus = device.status.some(({ code }) => code === 'smoke_sensor_status');
    if (hasSmokeSensorStatus) {
      props.store.tuya_capabilities.push('smoke_sensor_status');
      props.capabilities.push('alarm_smoke');
    }

    return props;
  }
};
