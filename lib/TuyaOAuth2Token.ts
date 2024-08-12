/* eslint-disable camelcase */

'use strict';

import {OAuth2Token} from 'homey-oauth2app';

export default class TuyaOAuth2Token extends OAuth2Token {

  region: string;
  uid: string;
  expire_time: number;

  constructor({
    region,
    uid,
    expire_time,
    ...props
  }: {
    region: string;
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

  toJSON() {
    return {
      ...super.toJSON(),
      region: this.region,
      uid: this.uid,
      expire_time: this.expire_time,
    };
  }

}

module.exports = TuyaOAuth2Token;
