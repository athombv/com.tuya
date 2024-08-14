import { OAuth2Token } from 'homey-oauth2app';
import { RegionCode } from './TuyaOAuth2Constants';

export default class TuyaOAuth2Token extends OAuth2Token {
  region: RegionCode;
  uid: string;
  expire_time: number;

  constructor({
    region,
    uid,
    expire_time,
    ...props
  }: {
    region: RegionCode;
    uid: string;
    expire_time: number;
    access_token: string;
    refresh_token: string;
    token_type?: string;
    expires_in?: number;
  }) {
    super({ ...props });

    this.region = region;

    /**
     * User ID
     * @property {String}
     */
    this.uid = uid;

    /**
     * Expires in (seconds)
     * @property {Number}
     */
    this.expire_time = expire_time;
  }

  toJSON(): {
    access_token: string;
    refresh_token: string;
    uid: string;
    expire_time: number;
    token_type?: string;
    region: RegionCode;
    expires_in?: number;
  } {
    return {
      ...super.toJSON(),
      region: this.region,
      uid: this.uid,
      expire_time: this.expire_time,
    };
  }
}

module.exports = TuyaOAuth2Token;
