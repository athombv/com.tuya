import { DEVICE_CATEGORIES } from '../../lib/TuyaOAuth2Constants';
import { ListDeviceProperties } from '../../lib/TuyaOAuth2Driver';
import TuyaOAuth2DriverSensor from '../../lib/TuyaOAuth2DriverSensor';
import {
  type TuyaDeviceDataPointResponse,
  TuyaDeviceResponse,
  TuyaDeviceSpecificationResponse,
} from '../../types/TuyaApiTypes';

module.exports = class TuyaOAuth2DriverSensorMotion extends TuyaOAuth2DriverSensor {
  TUYA_DEVICE_CATEGORIES = [DEVICE_CATEGORIES.SECURITY_VIDEO_SURV.MOTION_SENSOR] as const;

  onTuyaPairListDeviceProperties(
    device: TuyaDeviceResponse,
    specifications?: TuyaDeviceSpecificationResponse,
    dataPoints?: TuyaDeviceDataPointResponse,
  ): ListDeviceProperties {
    const props = super.onTuyaPairListDeviceProperties(device, specifications, dataPoints);

    // alarm_motion
    const hasPir = device.status.some(({ code }) => code === 'pir');
    if (hasPir) {
      props.store.tuya_capabilities.push('pir');
      props.capabilities.push('alarm_motion');
    }

    if (!specifications || !specifications.status) {
      return props;
    }

    for (const specification of specifications.status) {
      const tuyaCapability = specification.code;
      const values = JSON.parse(specification.values);
      if (tuyaCapability === 'pir') {
        if (!values.range.includes('none')) {
          props.settings['use_alarm_timeout'] = true;
        }
      }
    }

    return props;
  }
};
