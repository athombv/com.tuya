'use strict';

const { OAuth2App } = require('homey-oauth2app');
const TuyaOAuth2Client = require('./TuyaOAuth2Client');

/**
 * @extends Homey.App
 * @hideconstructor
 */
class TuyaOAuth2App extends OAuth2App {

  static OAUTH2_CLIENT = TuyaOAuth2Client;
  static OAUTH2_DEBUG = true;
  static REGIONS = {
    EU: 'eu',
    US: 'us', // Proxy not yet live
    IN: 'in', // Proxy not yet live
    CN: 'cn', // Proxy not yet live
  }

  async onInit(...props) {
    await super.onInit(...props);

    // Brand
    this.region = 'eu';
    this.proxyUrl = `https://tuya-${this.region}.athom.com/brand/homey`; // TODO: Multi-region support
    this.log(`Proxy URL: ${this.proxyUrl}`);

    this.setOAuth2Config({
      clientId: 'dummy',
      clientSecret: 'dummy',
      apiUrl: `${this.proxyUrl}/api`,
      tokenUrl: `${this.proxyUrl}/api/v1.0/token`,
      authorizationUrl: `${this.proxyUrl}/authorise`,
    });
  }

}

module.exports = TuyaOAuth2App;
