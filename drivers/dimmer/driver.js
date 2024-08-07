"use strict";

const TuyaOAuth2Driver = require("../../lib/TuyaOAuth2Driver");
const TuyaOAuth2Constants = require("../../lib/TuyaOAuth2Constants");
const { TUYA_PERCENTAGE_SCALING } = require("../../lib/TuyaOAuth2Constants");
const { SIMPLE_DIMMER_CAPABILITIES } = require("./TuyaDimmerConstants")

class TuyaOAuth2DriverDimmer extends TuyaOAuth2Driver {

  static TUYA_DEVICE_CATEGORIES = [
    TuyaOAuth2Constants.DEVICE_CATEGORIES.LIGHTING.DIMMER,
  ];

  async onInit() {
    await super.onInit();

    for (let switch_i = 1; switch_i <= 2; switch_i++) {
      this.homey.flow
        .getConditionCard(`dimmer_sub_switch_${switch_i}_is_on`)
        .registerRunListener((args) => {
          return args.device.getCapabilityValue(`onoff.${switch_i}`);
        });

      this.homey.flow
        .getActionCard(`dimmer_sub_switch_${switch_i}_off`)
        .registerRunListener(async (args) => {
          await args.device.singleOnOff(false, `switch_led_${switch_i}`);
        });

      this.homey.flow
        .getActionCard(`dimmer_sub_switch_${switch_i}_on`)
        .registerRunListener(async (args) => {
          await args.device.singleOnOff(true, `switch_led_${switch_i}`);
        });

      this.homey.flow
        .getActionCard(`dimmer_channel_${switch_i}_dim`)
        .registerRunListener(async (args) => {
          await args.device.singleDim(args.value, `bright_value_${switch_i}`);
        });
    }
  }

  onTuyaPairListDeviceProperties(device, specification) {
    const props = super.onTuyaPairListDeviceProperties(device);
    props.store.tuya_switches = [];
    props.store.tuya_dimmers = [];

    for (const status of device.status) {
      const tuyaCapability = status.code;

      if (
        SIMPLE_DIMMER_CAPABILITIES.read_write.includes(tuyaCapability) ||
        SIMPLE_DIMMER_CAPABILITIES.setting.includes(tuyaCapability)
      ) {
        props.store.tuya_capabilities.push(tuyaCapability);
      }

      if (
        tuyaCapability === "switch_led_1" ||
        tuyaCapability === "switch_led_2"
      ) {
        props.store.tuya_switches.push(tuyaCapability);
      }

      if (
        tuyaCapability === "bright_value_1" ||
        tuyaCapability === "bright_value_2"
      ) {
        props.store.tuya_dimmers.push(tuyaCapability);
      }
    }

    // On/Off
    if (props.store.tuya_switches.length > 0) {
      props.capabilities.push("onoff");
    }

    if (props.store.tuya_switches.length === 2) {
      for (let switch_i = 1; switch_i <= 2; switch_i++) {
        const subSwitchCapability = `onoff.${switch_i}`;
        props.capabilities.push(subSwitchCapability);
        props.capabilitiesOptions[subSwitchCapability] = {
          title: {
            en: `Switch ${switch_i}`,
          },
          insightsTitleTrue: {
            en: `Turned on (Switch ${switch_i})`,
          },
          insightsTitleFalse: {
            en: `Turned off (Switch ${switch_i})`,
          },
        };
      }

      props.capabilitiesOptions["onoff"] = {
        title: {
          en: "Switch All",
        },
        preventInsights: true,
      };
    }

    // Dim
    if (props.store.tuya_dimmers.length === 1) {
      props.capabilities.push("dim");
    }

    if (props.store.tuya_dimmers.length === 2) {
      for (let switch_i = 1; switch_i <= 2; switch_i++) {
        const subSwitchCapability = `dim.${switch_i}`;
        props.capabilities.push(subSwitchCapability);
        props.capabilitiesOptions[subSwitchCapability] = {
          title: {
            en: `Dim ${switch_i}`,
          },
          preventInsights: true,
        };
      }
    }

    for (const statusSpecification of specification.status) {
      const tuyaCapability = statusSpecification.code;
      const values = JSON.parse(statusSpecification.values);

      if (tuyaCapability === "bright_value_1") {
        props.settings["brightness_min_1"] = values.min / TUYA_PERCENTAGE_SCALING;
        props.settings["brightness_max_1"] = values.max / TUYA_PERCENTAGE_SCALING;
      }

      if (tuyaCapability === "bright_value_2") {
        props.settings["brightness_min_2"] = values.min / TUYA_PERCENTAGE_SCALING;
        props.settings["brightness_max_2"] = values.max / TUYA_PERCENTAGE_SCALING;
      }
    }

    return props;
  }
}

module.exports = TuyaOAuth2DriverDimmer;
