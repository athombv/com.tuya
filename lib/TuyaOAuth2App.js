'use strict';

const { OAuth2App } = require('homey-oauth2app');
const TuyaOAuth2Client = require('./TuyaOAuth2Client');

class TuyaOAuth2App extends OAuth2App {

  static OAUTH2_DEBUG = true;
  static OAUTH2_CLIENT = TuyaOAuth2Client;
  static OAUTH2_MULTI_SESSION = false;

}

module.exports = TuyaOAuth2App;
