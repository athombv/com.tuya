'use strict';

const TuyaOAuth2Driver = require('./TuyaOAuth2Driver');
const TuyaOAuth2Constants = require('./TuyaOAuth2Constants');

class TuyaOAuth2DriverSocket extends TuyaOAuth2Driver {

  static TUYA_DEVICE_CATEGORIES = [
    TuyaOAuth2Constants.DEVICE_CATEGORIES.ELECTRICAL_PRODUCTS.SOCKET,
    TuyaOAuth2Constants.DEVICE_CATEGORIES.ELECTRICAL_PRODUCTS.POWER_STRIP,
  ];

  // TODO: Add Flow Cards for onoff.switch_2, onoff.switch_3, onoff.switch_4, onoff.switch_5, onoff.switch_6

  onTuyaPairListDeviceProperties(device) {
    const props = super.onTuyaPairListDeviceProperties(device);
    props.capabilitiesOptions = {};
    props.store.tuya_switches = [];

    // Add this before the sub-capabilities, so it becomes the quick toggle
    props.capabilities.push('onoff')

    // onoff
    for (let switch_i = 1; switch_i <= 6; switch_i++) {
      const tuyaCapability = `switch_${switch_i}`;
      let hasAdditionalSwitch = device.status.some(({ code }) => code === tuyaCapability);
      if (hasAdditionalSwitch) {
        props.store.tuya_switches.push(tuyaCapability);
        props.store.tuya_capabilities.push(tuyaCapability);

        const homeyCapability = `onoff.switch_${switch_i}`;
        props.capabilities.push(homeyCapability);

        props.capabilitiesOptions[homeyCapability] = {
          title: `Switch ${switch_i}`,
          insightsTitleTrue: {
            en: `Turned on (Switch ${switch_i})`,
          },
          insightsTitleFalse: {
            en: `Turned off (Switch ${switch_i})`,
          },
        };
      }
    }

    const switchCount = props.store.tuya_switches.length;
    if (switchCount > 0) {
      if (switchCount === 1) {
        // Remove the sub-capability in favor of the regular 'onoff' capability
        props.capabilities.pop();
      } else {
        props.capabilitiesOptions['onoff'] = {
          title: 'Switch All',
          insightsTitleTrue: {
            en: 'Turned on all',
          },
          insightsTitleFalse: {
            en: 'Turned off all',
          },
        };
      }
    } else {
      // Remove the 'onoff' capability
      props.capabilities.pop()
    }

    // Power
    const powerCapabilities = {
      "cur_current": "measure_current",
      "cur_power": "measure_power",
      "cur_voltage": "measure_voltage",
    };

    for (const status of device.status) {
      const tuyaCapability = status.code;

      if (tuyaCapability in powerCapabilities) {
        props.store.tuya_capabilities.push(tuyaCapability);

        const homeyCapability = powerCapabilities[status.code]
        props.capabilities.push(homeyCapability);
      }
    }

    // TODO: USB sockets (?)

    return props;
  }

}

module.exports = TuyaOAuth2DriverSocket;
