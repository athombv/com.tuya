'use strict';

const TuyaOAuth2Driver = require('./TuyaOAuth2Driver');
const TuyaOAuth2Constants = require('./TuyaOAuth2Constants');
const TuyaOAuth2Util = require('./TuyaOAuth2Util');
const { SOCKET_SETTING_LABELS} = require('./TuyaSocketConstants');

class TuyaOAuth2DriverSocket extends TuyaOAuth2Driver {

  static TUYA_DEVICE_CATEGORIES = [
    TuyaOAuth2Constants.DEVICE_CATEGORIES.ELECTRICAL_PRODUCTS.SOCKET,
    TuyaOAuth2Constants.DEVICE_CATEGORIES.ELECTRICAL_PRODUCTS.POWER_STRIP,
    TuyaOAuth2Constants.DEVICE_CATEGORIES.ELECTRICAL_PRODUCTS.SWITCH,
    "tdq" // Undocumented switch category
  ];

  async onInit() {
    await super.onInit();

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
      .registerArgumentAutocompleteListener('switch', (query, args) => switchAutocompleteListener(query, args))
      .registerRunListener(async (args) => {
        await args.device.switchOnOff(true, args.switch.id).catch((err) => {
          this.error(err);
          throw new Error(this.homey.__("error_setting_switch"));
        });
      });

    this.homey.flow.getActionCard('socket_sub_switch_off')
      .registerArgumentAutocompleteListener('switch', (query, args) => switchAutocompleteListener(query, args))
      .registerRunListener(async (args) => {
      await args.device.switchOnOff(false, args.switch.id).catch((err) => {
        this.error(err);
        throw new Error(this.homey.__("error_setting_switch"));
      });
    });

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

    // Register setting flows
    this.homey.flow
      .getActionCard('socket_child_lock')
      .registerRunListener((args) => TuyaOAuth2Util.sendSetting(args.device, "child_lock", args.value, SOCKET_SETTING_LABELS));
  }

  onTuyaPairListDeviceProperties(device) {
    const props = super.onTuyaPairListDeviceProperties(device);
    props.capabilitiesOptions = {};
    props.store.tuya_switches = [];

    // Add this before the sub-capabilities, so it becomes the quick toggle
    props.capabilities.push('onoff')

    // onoff
    for (const status of device.status) {
      const tuyaCapability = status.code;

      if (tuyaCapability === 'switch') {
        props.store.tuya_switches.push(tuyaCapability);
        props.store.tuya_capabilities.push(tuyaCapability);

        props.capabilities.push(`onoff.switch`);

        // Break early, as having both switch and numbered switches should not occur and breaks stuff
        break;
      }

      for (let switch_i = 1; switch_i <= 6; switch_i++) {
        if (tuyaCapability === `switch_${switch_i}`) {
          props.store.tuya_switches.push(tuyaCapability);
          props.store.tuya_capabilities.push(tuyaCapability);

          const homeyCapability = `onoff.switch_${switch_i}`;
          props.capabilities.push(homeyCapability);

          props.capabilitiesOptions[homeyCapability] = {
            title: {
              en: `Switch ${switch_i}`
            },
            insightsTitleTrue: {
              en: `Turned on (Switch ${switch_i})`,
            },
            insightsTitleFalse: {
              en: `Turned off (Switch ${switch_i})`,
            },
          };
        }
      }
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
