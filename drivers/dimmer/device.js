"use strict";

const TuyaOAuth2Device = require("../../lib/TuyaOAuth2Device");
const { DIMMER_SETTING_LABELS } = require("./TuyaDimmerConstants");
const { TUYA_PERCENTAGE_SCALING } = require("../../lib/TuyaOAuth2Constants");

class TuyaOAuth2DeviceDimmer extends TuyaOAuth2Device {
  async onOAuth2Init() {
    await super.onOAuth2Init();

    if (this.hasCapability("onoff")) {
      this.registerCapabilityListener("onoff", (value) => this.allOnOff(value));
    }

    if (this.hasCapability("dim")) {
      this.registerCapabilityListener("dim", (value) => this.allDim(value));
    }

    for (let switch_i = 1; switch_i <= 2; switch_i++) {
      if (this.hasCapability(`onoff.${switch_i}`)) {
        this.registerCapabilityListener(`onoff.${switch_i}`, (value) => this.singleOnOff(value, `switch_led_${switch_i}`));
      }

      if (this.hasCapability(`dim.${switch_i}`)) {
        this.registerCapabilityListener(`dim.${switch_i}`, (value) => this.singleDim(value, `bright_value_${switch_i}`));
      }
    }
  }

  async safeSetCapabilityValue(capabilityId, value) {
    if (this.hasCapability(capabilityId)) {
      await this.setCapabilityValue(capabilityId, value);
    }
  }

  async onTuyaStatus(status, changed) {
    await super.onTuyaStatus(status);

    let anySwitchOn = false;

    for (let switch_i = 1; switch_i <= 2; switch_i++) {
      const tuyaSwitchCapability = `switch_led_${switch_i}`;
      const tuyaBrightnessCapability = `bright_value_${switch_i}`;
      const tuyaBrightnessMin = `brightness_min_${switch_i}`;
      const tuyaBrightnessMax = `brightness_max_${switch_i}`;
      const tuyaLampType = `led_type_${switch_i}`;

      const switchStatus = status[tuyaSwitchCapability];
      const brightnessStatus = status[tuyaBrightnessCapability];
      const brightnessMin = status[tuyaBrightnessMin];
      const brightnessMax = status[tuyaBrightnessMax];
      const lampType = status[tuyaLampType];

      if (typeof switchStatus === "boolean") {
        anySwitchOn = anySwitchOn || switchStatus;

        if (changed.includes(tuyaSwitchCapability)) {
          const triggerCard = this.homey.flow.getDeviceTriggerCard(`dimmer_sub_switch_${switch_i}_turned_${switchStatus ? "on" : "off"}`);
          triggerCard.trigger(this, {}, {}).catch(this.error);
        }

        await this.safeSetCapabilityValue(
          `onoff.${switch_i}`,
          switchStatus,
        ).catch(this.error);
      }

      if (typeof brightnessMin === "number") {
        await this.setSettings({
          [tuyaBrightnessMin]: brightnessMin / TUYA_PERCENTAGE_SCALING,
        });
      }

      if (typeof brightnessMax === "number") {
        await this.setSettings({
          [tuyaBrightnessMax]: brightnessMax / TUYA_PERCENTAGE_SCALING,
        });
      }

      if (lampType !== undefined) {
        await this.setSettings({
          [tuyaLampType]: lampType,
        });
      }

      if (typeof brightnessStatus === "number") {
        const scaleMin = this.getSetting(tuyaBrightnessMin) * TUYA_PERCENTAGE_SCALING;
        const scaleMax = this.getSetting(tuyaBrightnessMax) * TUYA_PERCENTAGE_SCALING;
        const scaledValue = (brightnessStatus - scaleMin) / (scaleMax - scaleMin);

        if (changed.includes(tuyaBrightnessCapability)) {
          const triggerCard = this.homey.flow.getDeviceTriggerCard(`dimmer_channel_${switch_i}_dim_changed`);
          triggerCard.trigger(this, {
            value: Math.round(scaledValue * 100) / 100, // Round to 2 decimals
          }).catch(this.error);
        }

        await this.safeSetCapabilityValue(`dim.${switch_i}`, scaledValue).catch(this.error);
        await this.safeSetCapabilityValue(`dim`, scaledValue).catch(this.error);
      }
    }

    await this.safeSetCapabilityValue("onoff", anySwitchOn).catch(this.error);
  }

  async onSettings({ oldSettings, newSettings, changedKeys }) {
    const unsupportedSettings = [];
    const unsupportedValues = [];

    for (const changedKey of changedKeys) {
      const newValue = newSettings[changedKey];
      await this.sendCommand({
        code: changedKey,
        value: typeof newValue === "number"
          ? newValue * TUYA_PERCENTAGE_SCALING
          : newValue,
      }).catch((err) => {
        if (err.tuyaCode === 2008) {
          unsupportedSettings.push(changedKey);
        } else if (err.tuyaCode === 501) {
          unsupportedValues.push(changedKey);
        } else {
          throw err;
        }
      });
    }

    // Report back which capabilities and values are unsupported,
    // since we cannot programmatically remove settings.
    const messages = [];

    if (unsupportedSettings.length > 0) {
      let unsupportedSettingsMessage = this.homey.__("settings_unsupported") + " ";
      const mappedSettingNames = unsupportedSettings.map(
        (settingKey) => DIMMER_SETTING_LABELS[settingKey],
      );
      unsupportedSettingsMessage += mappedSettingNames.join(", ");
      messages.push(unsupportedSettingsMessage);
    }
    if (unsupportedValues.length > 0) {
      let unsupportedValuesMessage = this.homey.__("setting_values_unsupported") + " ";
      const mappedSettingNames = unsupportedValues.map(
        (settingKey) => DIMMER_SETTING_LABELS[settingKey],
      );
      unsupportedValuesMessage += mappedSettingNames.join(", ");
      messages.push(unsupportedValuesMessage);
    }
    if (messages.length > 0) {
      return messages.join("\n");
    }
  }

  async commandAll(codes, value) {
    const commands = [];

    for (const code of codes) {
      commands.push({
        code: code,
        value: value,
      });
    }

    await this.sendCommands(commands);
  }

  async allOnOff(value) {
    const tuyaSwitches = this.getStore().tuya_switches;
    await this.commandAll(tuyaSwitches, value);
  }

  async singleOnOff(value, tuyaCapability) {
    await this.sendCommand({
      code: tuyaCapability,
      value: value,
    });
  }

  async allDim(value) {
    for (const tuyaDimmer of this.store.tuya_dimmers) {
      await this.singleDim(value, tuyaDimmer);
    }
  }

  async singleDim(value, tuyaCapability) {
    const subSwitch = tuyaCapability.at(tuyaCapability.length - 1);
    const scaleMin = this.getSetting(`brightness_min_${subSwitch}`) * TUYA_PERCENTAGE_SCALING;
    const scaleMax = this.getSetting(`brightness_max_${subSwitch}`) * TUYA_PERCENTAGE_SCALING;
    const scaledValue = Math.round(scaleMin + value * (scaleMax - scaleMin));

    await this.sendCommand({
      code: tuyaCapability,
      value: scaledValue,
    });
  }
}

module.exports = TuyaOAuth2DeviceDimmer;
