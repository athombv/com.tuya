'use strict';

const { OAuth2Driver } = require('homey-oauth2app');

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
        capabilities: this.onTuyaPairListDeviceCapabilities(device),
        name: device.name,
        data: {
          deviceId: device.id,
          productId: device.product_id,
        },
      }));
  }

  onTuyaPairListDeviceFilter(device) {
    return this.constructor.TUYA_DEVICE_CATEGORIES.includes(device.category);
  }

  onTuyaPairListDeviceCapabilities(device) {
    return [];
  }

}

module.exports = TuyaOAuth2Driver;
