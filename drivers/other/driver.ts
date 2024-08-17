import TuyaOAuth2Driver from '../../lib/TuyaOAuth2Driver';

module.exports = class TuyaOAuth2DriverOther extends TuyaOAuth2Driver {
  onTuyaPairListDeviceFilter(): boolean {
    return true; // Accept any device
  }
};
