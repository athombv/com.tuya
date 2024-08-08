'use strict';

const TuyaOAuth2Driver = require('../../lib/TuyaOAuth2Driver');
const TuyaOAuth2Constants = require('../../lib/TuyaOAuth2Constants');
const { HEATER_CAPABILITIES_MAPPING } = require('./TuyaHeaterConstants');

class TuyaOAuth2DriverHeater extends TuyaOAuth2Driver {

  static TUYA_DEVICE_CATEGORIES = [
    TuyaOAuth2Constants.DEVICE_CATEGORIES.SMALL_HOME_APPLIANCES.HEATER,
  ];

  async onInit() {
    await super.onInit();

    this.homey.flow
      .getActionCard("heater_set_child_lock")
      .registerRunListener(async (args) => {
        await args.device.triggerCapabilityListener("child_lock", args.value);
      });

    this.homey.flow
      .getActionCard("heater_set_eco_mode")
      .registerRunListener(async (args) => {
        await args.device.triggerCapabilityListener("eco_mode", args.value);
      });
  }

  onTuyaPairListDeviceProperties(device, specification) {
    const props = super.onTuyaPairListDeviceProperties(device);

    for (const status of device.status) {
      const tuyaCapability = status.code;

      if (tuyaCapability in HEATER_CAPABILITIES_MAPPING) {
        props.store.tuya_capabilities.push(tuyaCapability);

        const homeyCapability = HEATER_CAPABILITIES_MAPPING[tuyaCapability];
        props.capabilities.push(homeyCapability);
      }
    }

    for (const functionSpecification of specification.functions) {
      if (functionSpecification.code === 'temp_set') {
        const tempSetSpecs = JSON.parse(functionSpecification.values);
        props.capabilitiesOptions['target_temperature'] = {
          step: tempSetSpecs.step,
          min: tempSetSpecs.min,
          max: tempSetSpecs.max,
        };
      }
    }

    return props;
  }

}

module.exports = TuyaOAuth2DriverHeater;
