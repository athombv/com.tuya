'use strict';

const { OAuth2App } = require('homey-oauth2app');
const TuyaOAuth2Client = require('./TuyaOAuth2Client');
const TuyaOAuth2Constants = require('./TuyaOAuth2Constants');

class TuyaOAuth2App extends OAuth2App {

  static OAUTH2_DEBUG = true;
  static OAUTH2_CLIENT = TuyaOAuth2Client;
  static OAUTH2_MULTI_SESSION = false;

  async onInit(...props) {
    await super.onInit(...props);

    // Create an OAuth2 Config for every Tuya Region
    for (const region of Object.values(TuyaOAuth2Constants.REGIONS)) {
      this.homey.app.setOAuth2Config({
        configId: region,
        clientId: 'dummy',
        clientSecret: 'dummy',
        apiUrl: `https://tuya-${region}.athom.com/api`,
        tokenUrl: `https://tuya-${region}.athom.com/api/v1.0/token`,
        authorizationUrl: `https://tuya-${region}.athom.com/authorise`,
      });
    }
  }

}

module.exports = TuyaOAuth2App;
