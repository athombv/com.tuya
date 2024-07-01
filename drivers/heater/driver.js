'use strict';

const TuyaOAuth2Driver = require('../../lib/TuyaOAuth2Driver');
const TuyaOAuth2Constants = require('../../lib/TuyaOAuth2Constants');

class TuyaOAuth2DriverHeater extends TuyaOAuth2Driver {

  static TUYA_DEVICE_CATEGORIES = [
    TuyaOAuth2Constants.DEVICE_CATEGORIES.SMALL_HOME_APPLIANCES.HEATER,
  ];

  onTuyaPairListDeviceProperties(device) {
    const props = super.onTuyaPairListDeviceProperties(device);

    const abilityMapping = {
      'switch': 'onoff',
      'temp_set': 'target_temperature',
      'temp_current': 'measure_temperature',
      'lock': 'child_lock',
      'work_power': 'measure_power',
      "mode_eco": "eco_mode",
    }

    for (const status of device.status) {
      const tuyaCapability = status.code;

      if (tuyaCapability in abilityMapping) {
        props.store.tuya_capabilities.push(tuyaCapability);

        const homeyCapability = abilityMapping[status.code]
        props.capabilities.push(homeyCapability);
      }
    }

    return props;
  }

}

module.exports = TuyaOAuth2DriverHeater;
