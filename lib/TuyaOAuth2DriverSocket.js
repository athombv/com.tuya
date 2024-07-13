'use strict';

const TuyaOAuth2Driver = require('./TuyaOAuth2Driver');
const TuyaOAuth2Constants = require('./TuyaOAuth2Constants');

class TuyaOAuth2DriverSocket extends TuyaOAuth2Driver {

  static TUYA_DEVICE_CATEGORIES = [
    TuyaOAuth2Constants.DEVICE_CATEGORIES.ELECTRICAL_PRODUCTS.SOCKET,
    TuyaOAuth2Constants.DEVICE_CATEGORIES.ELECTRICAL_PRODUCTS.POWER_STRIP,
  ];

  async onInit() {
    await super.onInit();

    this.homey.flow.getActionCard('socket_sub_switch_on').registerRunListener(async (args) => {
      await args.device.switchOnOff(true, args.switch.id).catch(this.error);
    })

    this.homey.flow.getActionCard('socket_sub_switch_off').registerRunListener(async (args) => {
      await args.device.switchOnOff(false, args.switch.id).catch(this.error);
    })

    const switchAutocompleteListener = (query, args) => {
      const device = args.device;
      const tuyaSwitches = device.getStore().tuya_switches;
      return tuyaSwitches.map(value => {
        const switch_number = value.substring(7)
        const name = this.homey.__("switch", {number: switch_number});
        return {
          name: name,
          id: value,
        };
      })
    }

    // Register Socket switch flows
    this.homey.flow.getActionCard('socket_sub_switch_on')
      .registerArgumentAutocompleteListener('switch', (query, args) => switchAutocompleteListener(query, args));

    this.homey.flow.getActionCard('socket_sub_switch_off')
      .registerArgumentAutocompleteListener('switch', (query, args) => switchAutocompleteListener(query, args));

    this.homey.flow.getDeviceTriggerCard('socket_sub_switch_turned_on')
      .registerArgumentAutocompleteListener('switch', (query, args) => switchAutocompleteListener(query, args))
      .registerRunListener((args, state) => args.switch.id === state.tuyaCapability);

    this.homey.flow.getDeviceTriggerCard('socket_sub_switch_turned_off')
      .registerArgumentAutocompleteListener('switch', (query, args) => switchAutocompleteListener(query, args))
      .registerRunListener((args, state) => args.switch.id === state.tuyaCapability);

    this.homey.flow.getConditionCard('socket_sub_switch_is_on')
      .registerArgumentAutocompleteListener('switch', (query, args) => switchAutocompleteListener(query, args))
      .registerRunListener((args) => {
        const homeyCapability = `onoff.switch_${args.switch.id.substring(7)}`;
        return args.device.getCapabilityValue(homeyCapability);
      });
  }

  onTuyaPairListDeviceProperties(device) {
    const props = super.onTuyaPairListDeviceProperties(device);
    props.capabilitiesOptions = {};
    props.store.tuya_switches = [];

    // Add this before the sub-capabilities, so it becomes the quick toggle
    props.capabilities.push('onoff')

    // onoff
    const hasSwitch1 = device.status.some(({ code }) => code === `switch_1`);
    if (hasSwitch1) {
      props.store.tuya_switches.push(`switch_1`);
      props.store.tuya_capabilities.push(`switch_1`);

      props.capabilities.push(`onoff.switch_1`);

      props.capabilitiesOptions[`onoff.switch_1`] = {
        title: {
          en: `Switch 1`
        },
        insightsTitleTrue: {
          en: `Turned on (Switch 1)`,
        },
        insightsTitleFalse: {
          en: `Turned off (Switch 1)`,
        },
      };
    }

    const hasSwitch2 = device.status.some(({ code }) => code === `switch_2`);
    if (hasSwitch2) {
      props.store.tuya_switches.push(`switch_2`);
      props.store.tuya_capabilities.push(`switch_2`);

      props.capabilities.push(`onoff.switch_2`);

      props.capabilitiesOptions[`onoff.switch_2`] = {
        title: {
          en: `Switch 2`
        },
        insightsTitleTrue: {
          en: `Turned on (Switch 2)`,
        },
        insightsTitleFalse: {
          en: `Turned off (Switch 2)`,
        },
      };
    }

    const hasSwitch3 = device.status.some(({ code }) => code === `switch_3`);
    if (hasSwitch3) {
      props.store.tuya_switches.push(`switch_3`);
      props.store.tuya_capabilities.push(`switch_3`);

      props.capabilities.push(`onoff.switch_3`);

      props.capabilitiesOptions[`onoff.switch_3`] = {
        title: {
          en: `Switch 3`
        },
        insightsTitleTrue: {
          en: `Turned on (Switch 3)`,
        },
        insightsTitleFalse: {
          en: `Turned off (Switch 3)`,
        },
      };
    }

    const hasSwitch4 = device.status.some(({ code }) => code === `switch_4`);
    if (hasSwitch4) {
      props.store.tuya_switches.push(`switch_4`);
      props.store.tuya_capabilities.push(`switch_4`);

      props.capabilities.push(`onoff.switch_4`);

      props.capabilitiesOptions[`onoff.switch_4`] = {
        title: {
          en: `Switch 4`
        },
        insightsTitleTrue: {
          en: `Turned on (Switch 4)`,
        },
        insightsTitleFalse: {
          en: `Turned off (Switch 4)`,
        },
      };
    }

    const hasSwitch5 = device.status.some(({ code }) => code === `switch_5`);
    if (hasSwitch5) {
      props.store.tuya_switches.push(`switch_5`);
      props.store.tuya_capabilities.push(`switch_5`);

      props.capabilities.push(`onoff.switch_5`);

      props.capabilitiesOptions[`onoff.switch_5`] = {
        title: {
          en: `Switch 5`
        },
        insightsTitleTrue: {
          en: `Turned on (Switch 5)`,
        },
        insightsTitleFalse: {
          en: `Turned off (Switch 5)`,
        },
      };
    }

    const hasSwitch6 = device.status.some(({ code }) => code === `switch_6`);
    if (hasSwitch6) {
      props.store.tuya_switches.push(`switch_6`);
      props.store.tuya_capabilities.push(`switch_6`);

      props.capabilities.push(`onoff.switch_6`);

      props.capabilitiesOptions[`onoff.switch_6`] = {
        title: {
          en: `Switch 6`
        },
        insightsTitleTrue: {
          en: `Turned on (Switch 6)`,
        },
        insightsTitleFalse: {
          en: `Turned off (Switch 6)`,
        },
      };
    }


    const switchCount = props.store.tuya_switches.length;

    if (switchCount === 0) {
      // Remove the 'onoff' capability
      props.capabilities.pop()
    } else if (switchCount === 1) {
      // Remove the sub-capability in favor of the regular 'onoff' capability
      props.capabilities.pop();
    } else {
      props.capabilitiesOptions['onoff'] = {
        title: {
          en: 'Switch All'
        },
        preventInsights: true,
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
