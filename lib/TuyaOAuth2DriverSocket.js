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

    // onoff
    const hasSwitch1 = device.status.some(({ code }) => code === 'switch_1');
    if (hasSwitch1) {
      props.store.tuya_capabilities.push('switch_1');
      props.capabilities.push('onoff');
    }

    let hasAdditionalSwitches = false;
    for (let switch_i = 2; switch_i <= 6; switch_i++) {
      let hasAdditionalSwitch = device.status.some(({ code }) => code === `switch_${switch_i}`);
      if (hasAdditionalSwitch) {
        hasAdditionalSwitches = true;
        props.store.tuya_capabilities.push(`switch_${switch_i}`);
        props.capabilities.push(`onoff.switch_${switch_i}`);
        props.capabilitiesOptions = props.capabilitiesOptions ?? {};
        props.capabilitiesOptions[`onoff.switch_${switch_i}`] = {
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

    if (hasSwitch1 && hasAdditionalSwitches) {
      props.capabilitiesOptions = props.capabilitiesOptions ?? {};
      props.capabilitiesOptions['onoff'] = {
        title: 'Switch 1',
        insightsTitleTrue: {
          en: 'Turned on (Switch 1)',
        },
        insightsTitleFalse: {
          en: 'Turned off (Switch 1)',
        },
      };
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
