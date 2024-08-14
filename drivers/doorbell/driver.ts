import { DEVICE_CATEGORIES } from '../../lib/TuyaOAuth2Constants';
import TuyaOAuth2Driver from '../../lib/TuyaOAuth2Driver';
import { TuyaDeviceResponse } from '../../types/TuyaApiTypes';

// TODO refactor to be in line with other drivers
module.exports = class TuyaOAuth2DriverDoorbell extends TuyaOAuth2Driver {
  TUYA_DEVICE_CATEGORIES = [DEVICE_CATEGORIES.SECURITY_VIDEO_SURV.SMART_CAMERA] as const;

  onTuyaPairListDeviceFilter(device: TuyaDeviceResponse): boolean {
    if (!super.onTuyaPairListDeviceFilter(device)) return false;

    // Require a doorbell capability
    return !!device.status.find(status => status.code === 'doorbell_active');
  }

  // onTuyaPairListDeviceProperties(device) {
  //   const props = super.onTuyaPairListDeviceProperties(device);

  //   return props;
  // }
};
