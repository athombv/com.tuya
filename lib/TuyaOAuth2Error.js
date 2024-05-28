'use strict';

const { OAuth2Error } = require('homey-oauth2app');

/**
 * @extents OAuth2Error
 */
class TuyaOAuth2Error extends OAuth2Error {

  constructor(message, statusCode, tuyaCode) {
    super(message, statusCode);

    /**
     * Tuya Error Code
     * @property {Number}
     */
    this.tuyaCode = tuyaCode;
  }

}

module.exports = TuyaOAuth2Error;
