'use strict';

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

}

module.exports = TuyaOAuth2Util;
