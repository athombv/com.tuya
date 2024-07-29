'use strict';

const crypto = require('crypto');

/**
 * Utilities class.
 * @hideconstructor
 */
class TuyaOAuth2Util {

  /**
   * This method converts:
   * ```js
   * [{ code: 'foo', value: '{"x": "y"}' }]
   * ```
   *
   * to:
   *
   * ```js
   * { foo: { x: y } }
   * ```
   * @param {Array} statuses
   * @returns {Object}
   */
  static convertStatusArrayToStatusObject(statuses) {
    return statuses.reduce((obj, item) => {
      obj[item.code] = item.value;

      // Parse JSON
      if (typeof obj[item.code] === 'string' && obj[item.code].startsWith('{')) {
        try {
          obj[item.code] = JSON.parse(obj[item.code]);
        } catch (err) { }
      }

      return obj;
    }, {});
  }

  /*
   * Sign headers for the Tuya API
   */
  static getSignedHeaders({
    method,
    body,
    path,
    clientId,
    clientSecret,
    accessToken = null,
    nonce = crypto.randomBytes(16).toString('hex'),
    bundleId = 'app.homey',
    t = Date.now(),
  }) {
    const headers = {};

    // Calculate signature
    const contentHash = crypto
      .createHash('sha256')
      .update(body || '')
      .digest('hex');

    const stringToSign = typeof accessToken === 'string'
      ? `${clientId}${accessToken}${t}${nonce}${bundleId}${method}\n${contentHash}\n\n${path}`
      : `${clientId}${t}${nonce}${bundleId}${method}\n${contentHash}\n\n${path}`;

    headers['t'] = String(t);
    headers['nonce'] = String(nonce);
    headers['client_id'] = String(clientId);
    headers['sign_method'] = 'HMAC-SHA256';
    headers['sign'] = crypto.createHmac('sha256', clientSecret)
      .update(stringToSign)
      .digest('hex')
      .toUpperCase();

    if (typeof accessToken === 'string') {
      headers['access_token'] = accessToken;
    }

    return headers;
  }

  /*
   * Redact sensitive fields when logging Device information
   */
  static redactFields(device, fields) {
    const newObj = JSON.parse(JSON.stringify(device));
    fields.forEach((field) => {
      if (newObj.device.hasOwnProperty(field)) {
        newObj.device[field] = '<redacted>';
      }
    });
    return newObj;
  }

}

module.exports = TuyaOAuth2Util;
