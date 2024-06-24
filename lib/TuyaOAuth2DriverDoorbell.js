'use strict';

const TuyaOAuth2Driver = require('./TuyaOAuth2Driver');
const TuyaOAuth2Constants = require('./TuyaOAuth2Constants');

class TuyaOAuth2DriverDoorbell extends TuyaOAuth2Driver {

  static TUYA_DEVICE_CATEGORIES = [
    TuyaOAuth2Constants.DEVICE_CATEGORIES.SECURITY_VIDEO_SURV.SMART_CAMERA,
  ];

  onTuyaPairListDeviceFilter(device) {
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
