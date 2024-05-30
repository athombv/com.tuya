'use strict';

const { OAuth2Driver } = require('homey-oauth2app');
const TuyaOAuth2Constants = require('./TuyaOAuth2Constants');

/**
 * @extends OAuth2Driver
 * @hideconstructor
 */
class TuyaOAuth2Driver extends OAuth2Driver {

  static TUYA_DEVICE_CATEGORIES = [];

  async onPairListDevices({ oAuth2Client }) {
    const devices = await oAuth2Client.getDevices();
    return devices
      .filter(device => {
        return this.onTuyaPairListDeviceFilter(device);
      })
      .map(device => ({
        name: device.name,
        data: {
          deviceId: device.id,
          productId: device.product_id,
        },
        store: {},
        capabilities: [],
        capabilitiesOptions: {},
        ...this.onTuyaPairListDeviceProperties({ ...device }),
      }));
  }

  onTuyaPairListDeviceFilter(device) {
    return this.constructor.TUYA_DEVICE_CATEGORIES.includes(device.category);
  }

  onTuyaPairListDeviceProperties(device) {
    const props = {
      capabilities: [],
      store: {
        tuya_capabilities: [],
      },
    };

    return props;
  }

}

module.exports = TuyaOAuth2Driver;
