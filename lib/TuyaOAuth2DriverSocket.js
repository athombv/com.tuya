'use strict';

const TuyaOAuth2Driver = require('./TuyaOAuth2Driver');
const TuyaOAuth2Constants = require('./TuyaOAuth2Constants');

class TuyaOAuth2DriverSocket extends TuyaOAuth2Driver {

  static TUYA_DEVICE_CATEGORIES = [
    TuyaOAuth2Constants.DEVICE_CATEGORIES.ELECTRICAL_PRODUCTS.SOCKET,

    // TODO: Multiple sockets (?)
    // TuyaOAuth2Constants.DEVICE_CATEGORIES.ELECTRICAL_PRODUCTS.POWER_STRIP,
  ];

  onTuyaPairListDeviceProperties(device) {
    const props = {
      capabilities: [],
    };

    // onoff
    const hasSwitch1 = device.status.some(({ code }) => code === 'switch_1');
    if (hasSwitch1) {
      props.store.tuya_capabilities.push('switch_1');
      props.capabilities.push('onoff');
    }

    // TODO: Multiple sockets (?)

    return props;
  }

}

module.exports = TuyaOAuth2DriverSocket;
