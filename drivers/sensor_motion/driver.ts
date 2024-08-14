import TuyaOAuth2DriverSensor from '../../lib/TuyaOAuth2DriverSensor';
import { TuyaDeviceResponse, TuyaDeviceSpecificationResponse } from '../../types/TuyaApiTypes';
import { DEVICE_CATEGORIES } from '../../lib/TuyaOAuth2Constants';

module.exports = class TuyaOAuth2DriverSensorMotion extends TuyaOAuth2DriverSensor {
  TUYA_DEVICE_CATEGORIES = [DEVICE_CATEGORIES.SECURITY_VIDEO_SURV.MOTION_SENSOR] as const;

  onTuyaPairListDeviceProperties(device: TuyaDeviceResponse, specifications: TuyaDeviceSpecificationResponse) {
    const props = super.onTuyaPairListDeviceProperties(device, specifications);

    // alarm_motion
    const hasPir = device.status.some(({ code }) => code === 'pir');
    if (hasPir) {
      props.store.tuya_capabilities.push('pir');
      props.capabilities.push('alarm_motion');
    }

    return props;
  }
};
