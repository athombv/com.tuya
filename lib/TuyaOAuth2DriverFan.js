'use strict';

const TuyaOAuth2Driver = require('./TuyaOAuth2Driver');
const TuyaOAuth2Constants = require('./TuyaOAuth2Constants');

/**
 * @extends TuyaOAuth2Driver
 * @hideconstructor
 */
class TuyaOAuth2DriverLight extends TuyaOAuth2Driver {

  static TUYA_DEVICE_CATEGORIES = [
    TuyaOAuth2Constants.DEVICE_CATEGORIES.SMALL_HOME_APPLIANCES.FAN,
    // TODO
  ];

  onTuyaPairListDeviceProperties(device) {
    const props = super.onTuyaPairListDeviceProperties(device);

    // onoff
    const hasSwitch = device.status.some(({ code }) => code === 'switch');
    if (hasSwitch) {
      props.capabilities.push('onoff');
    }

    return props;
  }

}

module.exports = TuyaOAuth2DriverLight;
