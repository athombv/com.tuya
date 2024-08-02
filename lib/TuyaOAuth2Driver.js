'use strict';

const { OAuth2Driver } = require('homey-oauth2app');
const TuyaOAuth2Util = require('./TuyaOAuth2Util');

/**
 * @extends OAuth2Driver
 * @hideconstructor
 */
class TuyaOAuth2Driver extends OAuth2Driver {

  static TUYA_DEVICE_CATEGORIES = [];

  async onPairListDevices({ oAuth2Client }) {
    const devices = await oAuth2Client.getDevices();
    const filteredDevices = devices
      .filter(device => {
        this.log('Device:', JSON.stringify(TuyaOAuth2Util.redactFields(device)));
        return this.onTuyaPairListDeviceFilter(device);
      });
    const listDevices = [];
    for (const device of filteredDevices) {
      const deviceSpecs = await oAuth2Client.getSpecification({deviceId: device.id});
      const deviceProperties = this.onTuyaPairListDeviceProperties({...device}, deviceSpecs);
      listDevices.push({
        name: device.name,
        data: {
          deviceId: device.id,
          productId: device.product_id,
        },
        store: {},
        capabilities: [],
        capabilitiesOptions: {},
        ...deviceProperties,
      });
    }
    return listDevices;
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
      capabilitiesOptions: {},
      settings: {},
    };

    return props;
  }

}

module.exports = TuyaOAuth2Driver;
