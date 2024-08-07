"use strict";

const TuyaOAuth2Device = require("../../lib/TuyaOAuth2Device");
const {
  SIMPLE_CAMERA_CAPABILITIES,
  CAMERA_ALARM_EVENT_CAPABILITIES,
  CAMERA_SETTING_LABELS,
} = require("./TuyaCameraConstants");

/**
 * Device Class for Tuya Smart Cameras
 */
class TuyaOAuth2DeviceCamera extends TuyaOAuth2Device {
  async onOAuth2Init() {
    await super.onOAuth2Init();

    for (const capability of this.getCapabilities()) {
      // Basic capabilities
      if (SIMPLE_CAMERA_CAPABILITIES.read_write.includes(capability)) {
        this.registerCapabilityListener(capability, (value) => this.sendCommand({
            code: capability,
            value: value,
          }),
        );
      }

      // PTZ control
      if (
        capability === "ptz_control_horizontal" ||
        capability === "ptz_control_vertical"
      ) {
        this.registerCapabilityListener(capability, (value) => this.ptzCapabilityListener(value));
      }

      if (capability === "ptz_control_zoom") {
        this.registerCapabilityListener(capability, (value) => this.zoomCapabilityListener(value));
      }

      // Other capabilities
      if (capability === "onoff") {
        this.registerCapabilityListener(capability, (value) => this.sendCommand({
            code: "basic_private",
            value: !value,
          }),
        );
      }
    }
  }

  async onTuyaStatus(status, changed) {
    await super.onTuyaStatus(status, changed);

    for (const statusKey in status) {
      const value = status[statusKey];

      // Basic capabilities
      if (
        SIMPLE_CAMERA_CAPABILITIES.read_write.includes(statusKey) ||
        SIMPLE_CAMERA_CAPABILITIES.read_only.includes(statusKey)
      ) {
        await this.setCapabilityValue(statusKey, value).catch(this.error);
      }

      if (SIMPLE_CAMERA_CAPABILITIES.setting.includes(statusKey)) {
        await this.setSettings({
          [statusKey]: value,
        }).catch(this.error);
      }

      // PTZ control
      if (statusKey === "ptz_stop" && value) {
        await this.setCapabilityValue("ptz_control_horizontal", "stop").catch(this.error);
        await this.setCapabilityValue("ptz_control_vertical", "stop").catch(this.error);
      }

      if (statusKey === "zoom_stop" && value) {
        await this.setCapabilityValue("ptz_control_zoom", "stop").catch(this.error);
      }

      // Other capabilities
      if (statusKey === "basic_private") {
        await this.setCapabilityValue("onoff", !value).catch(this.error);
      }

      if (statusKey === "wireless_electricity") {
        await this.setCapabilityValue("measure_battery", value).catch(this.error);
      }

      // Event messages
      if (
        statusKey === "initiative_message" &&
        changed.includes("initiative_message")
      ) {
        // Event messages are base64 encoded JSON
        const encoded = status[statusKey];
        const decoded = new Buffer.from(encoded, "base64");
        const data = JSON.parse(decoded.toString());
        const notificationType = data.cmd;
        const dataType = data.type;
        this.log("Notification:", notificationType, dataType);

        // Check if the event is for a known alarm
        if (notificationType in CAMERA_ALARM_EVENT_CAPABILITIES) {
          const alarmCapability = CAMERA_ALARM_EVENT_CAPABILITIES[notificationType];
          if (!this.hasCapability(alarmCapability)) {
            await this.addCapability(alarmCapability).catch(this.error);
          }

          const deviceTriggerCard = this.homey.flow.getDeviceTriggerCard(`camera_${alarmCapability}_true`);
          await deviceTriggerCard.trigger(this);
          await this.setCapabilityValue(alarmCapability, true).catch(this.error);

          // Disable the alarm after a set time, since we only get an "on" event
          const alarmTimeout = Math.round(
            (this.getSetting("alarm_timeout") ?? 10) * 1000,
          );
          setTimeout(async () => {
            await this.setCapabilityValue(alarmCapability, false).catch(this.error);
          }, alarmTimeout);
        }
      }
    }
  }

  async ptzCapabilityListener(value) {
    if (value === "stop") {
      await this.sendCommand({
        code: "ptz_stop",
        value: true,
      });
    } else {
      await this.sendCommand({
        code: "ptz_control",
        value: value,
      });
    }
  }

  async zoomCapabilityListener(value) {
    if (value === "stop") {
      await this.sendCommand({
        code: "zoom_stop",
        value: true,
      });
    } else {
      await this.sendCommand({
        code: "zoom_control",
        value: value,
      });
    }
  }

  async onSettings({ oldSettings, newSettings, changedKeys }) {
    const unsupportedSettings = [];

    for (const changedKey of changedKeys) {
      const newValue = newSettings[changedKey];
      await this.sendCommand({
        code: changedKey,
        value: newValue,
      }).catch((err) => {
        if (err.tuyaCode === 2008) {
          unsupportedSettings.push(changedKey);
        } else {
          throw err;
        }
      });
    }

    // Report back which capabilities are unsupported,
    // since we cannot programmatically remove settings.
    if (unsupportedSettings.length > 0) {
      let unsupportedSettingsMessage =
        this.homey.__("settings_unsupported") + " ";
      const mappedSettingNames = unsupportedSettings.map(
        (settingKey) => CAMERA_SETTING_LABELS[settingKey],
      );
      unsupportedSettingsMessage += mappedSettingNames.join(", ");
      return unsupportedSettingsMessage;
    }
  }
}

module.exports = TuyaOAuth2DeviceCamera;
