"use strict";

const TuyaOAuth2Device = require("../../lib/TuyaOAuth2Device");
const {
  SIMPLE_CAMERA_CAPABILITIES,
  CAMERA_ALARM_EVENT_CAPABILITIES,
} = require("./driver");

/**
 * Device Class for Tuya Smart Cameras
 */
class TuyaOAuth2DeviceCamera extends TuyaOAuth2Device {
  async onOAuth2Init() {
    await super.onOAuth2Init();

    for (const capability of this.getCapabilities()) {
      if (SIMPLE_CAMERA_CAPABILITIES.read_write.includes(capability)) {
        this.registerCapabilityListener(capability, async (value) =>
          this.sendCommand({
            code: capability,
            value: value,
          }),
        );
      }

      if (
        capability === "ptz_control_horizontal" ||
        capability === "ptz_control_vertical"
      ) {
        this.registerCapabilityListener(capability, async (value) =>
          this.ptzCapabilityListener(value),
        );
      }

      if (capability === "ptz_control_zoom") {
        this.registerCapabilityListener(capability, async (value) =>
          this.zoomCapabilityListener(value),
        );
      }

      if (capability === "volume_set") {
        this.registerCapabilityListener(capability, async (value) => {
          // From range [0.1, 1] to [1, 10]
          const rangedValue = Math.round(value * 10.0);
          return this.sendCommand({
            code: "basic_device_volume",
            value: rangedValue,
          });
        });
      }
    }
  }

  async onTuyaStatus(status, changed) {
    await super.onTuyaStatus(status, changed);

    for (const statusKey in status) {
      const value = status[statusKey];

      if (
        SIMPLE_CAMERA_CAPABILITIES.read_write.includes(statusKey) ||
        SIMPLE_CAMERA_CAPABILITIES.read_only.includes(statusKey)
      ) {
        await this.setCapabilityValue(statusKey, value).catch((err) =>
          this.error(err),
        );
      }

      if (SIMPLE_CAMERA_CAPABILITIES.setting.includes(statusKey)) {
        await this.setSettings({
          [statusKey]: value,
        }).catch((err) => this.error(err));
      }

      if (statusKey === "ptz_stop" && value) {
        await this.setCapabilityValue("ptz_control_horizontal", "stop").catch(
          (err) => this.error(err),
        );
        await this.setCapabilityValue("ptz_control_vertical", "stop").catch(
          (err) => this.error(err),
        );
      }

      if (statusKey === "zoom_stop" && value) {
        await this.setCapabilityValue("ptz_control_zoom", "stop").catch((err) =>
          this.error(err),
        );
      }

      if (statusKey === "basic_device_volume") {
        // From range [1, 10] to [0.1, 1]
        const rangedValue = value / 10.0;
        await this.setCapabilityValue("volume_set", rangedValue).catch((err) =>
          this.error(err),
        );
      }

      if (
        statusKey === "initiative_message" &&
        changed.includes("initiative_message")
      ) {
        const encoded = status[statusKey];
        const decoded = new Buffer.from(encoded, "base64");
        const data = JSON.parse(decoded.toString());
        // this.log('Notification data:', data)
        const notificationType = data.cmd;
        const dataType = data.type;
        this.log("Notification:", notificationType, dataType);
        // TODO AES decrypt image

        /* Notification types:
            capabilities seen:
            + ipc_bang          Abnormal sound
            + ipc_motion        Motion detection
            + ipc_baby_cry      Baby cry
            + ipc_cat           Pet detection
            not seen:
            - ipc_doorbell      Doorbell call
            - ipc_dev_link      Device linkage
            - ipc_passby        Someone passes by
            - ipc_linger        Someone lingers
            - ipc_leave_msg     Leave messages on doorbell
            - ipc_connected     Doorbell answered
            - ipc_unconnected   Doorbell missed
            - ipc_refuse        Doorbell rejected
            - ipc_human         Human shape detection
            - ipc_car           Vehicle detection
            - ipc_antibreak     Tamper alarm
            - ipc_low_battery   Low battery alert
        */
        if (notificationType in CAMERA_ALARM_EVENT_CAPABILITIES) {
          const alarmCapability =
            CAMERA_ALARM_EVENT_CAPABILITIES[notificationType];
          if (!this.hasCapability(alarmCapability)) {
            await this.addCapability(alarmCapability).catch(this.error);
          }
          await this.setCapabilityValue(alarmCapability, true).catch(
            this.error,
          );
          setTimeout(async () => {
            await this.setCapabilityValue(alarmCapability, false).catch(
              this.error,
            );
          }, 5 * 1000); // TODO make setting
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

    const settingLabels = {
      motion_sensitivity: "Motion Sensitivity",
      decibel_sensitivity: "Sound Sensitivity",
      basic_anti_flicker: "Anti-Flicker",
    };

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

    if (unsupportedSettings.length > 0) {
      // TODO make translatable
      let unsupportedSettingsMessage =
        "Some of the changed settings are not supported by the device: ";
      const mappedSettingNames = unsupportedSettings.map(
        (settingKey) => settingLabels[settingKey],
      );
      unsupportedSettingsMessage += mappedSettingNames.join(", ");
      return unsupportedSettingsMessage;
    }
  }
}

module.exports = TuyaOAuth2DeviceCamera;
