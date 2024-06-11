'use strict';

const TuyaOAuth2Driver = require('../../lib/TuyaOAuth2Driver');

module.exports = class TuyaOAuth2DriverOther extends TuyaOAuth2Driver {

  onTuyaPairListDeviceFilter() {
    return true; // Accept any device
  }

};
