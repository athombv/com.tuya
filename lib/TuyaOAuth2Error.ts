import { OAuth2Error } from 'homey-oauth2app';

export default class TuyaOAuth2Error extends OAuth2Error {
  tuyaCode?: number;

  constructor(message: string, statusCode?: number, tuyaCode?: number) {
    super(message, statusCode);

    this.tuyaCode = tuyaCode;
  }
}

module.exports = TuyaOAuth2Error;
