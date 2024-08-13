'use strict';

import TuyaOAuth2Driver from '../../lib/TuyaOAuth2Driver';
import {TuyaDeviceResponse} from "../../types/TuyaApiTypes";
import {DEVICE_CATEGORIES} from "../../lib/TuyaOAuth2Constants";

// TODO refactor to be in line with other drivers
export default class TuyaOAuth2DriverDoorbell extends TuyaOAuth2Driver {

  TUYA_DEVICE_CATEGORIES = [
    DEVICE_CATEGORIES.SECURITY_VIDEO_SURV.SMART_CAMERA,
  ];

  onTuyaPairListDeviceFilter(device: TuyaDeviceResponse) {
    if (!super.onTuyaPairListDeviceFilter(device)) return false;

    // Require a doorbell capability
    return !!device.status.find(status => status.code === 'doorbell_active');

  }

  // onTuyaPairListDeviceProperties(device) {
  //   const props = super.onTuyaPairListDeviceProperties(device);

  //   return props;
  // }

}

module.exports = TuyaOAuth2DriverDoorbell;
