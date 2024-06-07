'use strict';

const TuyaOAuth2Device = require('../../lib/TuyaOAuth2Device');

module.exports = class TuyaOAuth2DeviceOther extends TuyaOAuth2Device {

  async onOAuth2Init() {
    // Do nothing here. We don't want an 'other' device to subscribe to webhook events.
    // If a user has the same physical device also paired, e.g. a light bulb, that device might not receive the events.
  }

};
