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

    const hasSwitch2 = device.status.some(({ code }) => code === 'switch_2');
    if (hasSwitch2) {
      props.store.tuya_capabilities.push('switch_2');
      props.capabilities.push('onoff.switch_2');
      props.capabilitiesOptions = props.capabilitiesOptions ?? {};
      props.capabilitiesOptions['onoff.switch_2'] = {
        title: 'Switch 2',
        insightsTitleTrue: {
          en: 'Turned on (Switch 2)',
        },
        insightsTitleFalse: {
          en: 'Turned off (Switch 2)',
        },
      };
    }

    const hasSwitch3 = device.status.some(({ code }) => code === 'switch_3');
    if (hasSwitch3) {
      props.store.tuya_capabilities.push('switch_3');
      props.capabilities.push('onoff.switch_3');
      props.capabilitiesOptions = props.capabilitiesOptions ?? {};
      props.capabilitiesOptions['onoff.switch_3'] = {
        title: 'Switch 3',
        insightsTitleTrue: {
          en: 'Turned on (Switch 3)',
        },
        insightsTitleFalse: {
          en: 'Turned off (Switch 3)',
        },
      };
    }

    const hasSwitch4 = device.status.some(({ code }) => code === 'switch_4');
    if (hasSwitch4) {
      props.store.tuya_capabilities.push('switch_4');
      props.capabilities.push('onoff.switch_4');
      props.capabilitiesOptions = props.capabilitiesOptions ?? {};
      props.capabilitiesOptions['onoff.switch_4'] = {
        title: 'Switch 4',
        insightsTitleTrue: {
          en: 'Turned on (Switch 4)',
        },
        insightsTitleFalse: {
          en: 'Turned off (Switch 4)',
        },
      };
    }

    const hasSwitch5 = device.status.some(({ code }) => code === 'switch_5');
    if (hasSwitch5) {
      props.store.tuya_capabilities.push('switch_5');
      props.capabilities.push('onoff.switch_5');
      props.capabilitiesOptions = props.capabilitiesOptions ?? {};
      props.capabilitiesOptions['onoff.switch_5'] = {
        title: 'Switch 5',
        insightsTitleTrue: {
          en: 'Turned on (Switch 5)',
        },
        insightsTitleFalse: {
          en: 'Turned off (Switch 5)',
        },
      };
    }

    const hasSwitch6 = device.status.some(({ code }) => code === 'switch_6');
    if (hasSwitch6) {
      props.store.tuya_capabilities.push('switch_6');
      props.capabilities.push('onoff.switch_6');
      props.capabilitiesOptions = props.capabilitiesOptions ?? {};
      props.capabilitiesOptions['onoff.switch_6'] = {
        title: 'Switch 6',
        insightsTitleTrue: {
          en: 'Turned on (Switch 6)',
        },
        insightsTitleFalse: {
          en: 'Turned off (Switch 6)',
        },
      };
    }

    if (hasSwitch1 && (hasSwitch2 || hasSwitch3 || hasSwitch4 || hasSwitch5 || hasSwitch6)) {
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
