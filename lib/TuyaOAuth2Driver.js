'use strict';

const { OAuth2Driver } = require('homey-oauth2app');
const TuyaOAuth2Constants = require('./TuyaOAuth2Constants');

/**
 * @extends OAuth2Driver
 * @hideconstructor
 */
class TuyaOAuth2Driver extends OAuth2Driver {

  static TUYA_DEVICE_CATEGORIES = [];

  async onInit() {
    // This method is overloaded to prevent the automatic initialization of the OAuth2 configuration
    // this.setOAuth2ConfigId(this.constructor.OAUTH2_CONFIG_ID);
    // await this.onOAuth2Init();
  }

  onPair(socket) {
    socket
      .setHandler('tuya_has_session', async () => {
        const savedOAuth2Sessions = await this.homey.app.getSavedOAuth2Sessions();
        if (Object.keys(savedOAuth2Sessions).length === 0) return false;

        const firstSavedOAuth2Session = savedOAuth2Sessions[Object.keys(savedOAuth2Sessions)[0]];

        this.setOAuth2ConfigId(firstSavedOAuth2Session.configId);
        await this.onOAuth2Init();

        super.onPair(socket);

        return true;
      })
      .setHandler('tuya_list_countries', async () => {
        return {
          ...TuyaOAuth2Constants.COUNTRIES,
        };
      })
      .setHandler('tuya_set_country', async (countryCode) => {
        const country = TuyaOAuth2Constants.COUNTRIES[countryCode];
        if (!country) {
          throw new Error(`Invalid Country Code: ${countryCode}`);
        }

        if (country.region === TuyaOAuth2Constants.REGIONS.US) {
          throw new Error('Sorry, but the North America region is not supported yet.');
        }

        if (country.region === TuyaOAuth2Constants.REGIONS.IN) {
          throw new Error('Sorry, but the India region is not supported yet.');
        }

        if (country.region === TuyaOAuth2Constants.REGIONS.CN) {
          throw new Error('Sorry, but the China region is not supported yet.');
        }

        this.setOAuth2ConfigId(country.region);
        await this.onOAuth2Init();

        super.onPair(socket);
      });
  }

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
