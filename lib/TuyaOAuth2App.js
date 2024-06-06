'use strict';

const { OAuth2App } = require('homey-oauth2app');
const TuyaOAuth2Client = require('./TuyaOAuth2Client');

class TuyaOAuth2App extends OAuth2App {

  static OAUTH2_CLIENT = TuyaOAuth2Client;
  static OAUTH2_DEBUG = process.env.DEBUG === '1';
  static OAUTH2_MULTI_SESSION = false; // TODO: Enable this feature & make nice pairing UI

}

module.exports = TuyaOAuth2App;
