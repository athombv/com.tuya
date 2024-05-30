/* eslint-disable camelcase */

'use strict';

const { OAuth2Token } = require('homey-oauth2app');

/**
 * @extends OAuth2Token
 */
class TuyaOAuth2Token extends OAuth2Token {

  constructor({
    region,
    uid,
    expire_time,
    ...props
  }) {
    super({ ...props });

    /**
     * API Region
     * @property {String}
     */
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
