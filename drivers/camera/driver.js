"use strict";

const TuyaOAuth2Driver = require("../../lib/TuyaOAuth2Driver");
const TuyaOAuth2Constants = require("../../lib/TuyaOAuth2Constants");

class TuyaOAuth2DriverCamera extends TuyaOAuth2Driver {
  static TUYA_DEVICE_CATEGORIES = [
    TuyaOAuth2Constants.DEVICE_CATEGORIES.SECURITY_VIDEO_SURV.SMART_CAMERA,
  ];

  // TODO make translatable
  // Map from setting id to human-readable label
  static CAMERA_SETTING_LABELS = {
    motion_switch: "Motion Detection",
    motion_tracking: "Motion Tracking",
    decibel_switch: "Sound Detection",
    cry_detection_switch: "Crying Baby Detection",
    pet_detection: "Pet Detection",
    motion_sensitivity: "Motion Sensitivity",
    decibel_sensitivity: "Sound Sensitivity",
    basic_nightvision: "Night Mode",
    basic_device_volume: "Device Volume",
    basic_anti_flicker: "Anti-Flicker",
    basic_osd: "Video Timestamp",
    basic_flip: "Flip Video",
    basic_indicator: "Status Indicator",
  };

  static SIMPLE_CAMERA_FLOWS = {
    read_write: ["cruise_switch", "siren_switch"],
    setting: [
      "motion_switch",
      "decibel_switch",
      "cry_detection_switch",
      "pet_detection",
      "motion_tracking",
      "basic_nightvision",
    ],
  };

  async onInit() {
    await super.onInit();

    for (const capability of TuyaOAuth2DriverCamera.SIMPLE_CAMERA_FLOWS.read_write) {
      this.homey.flow
        .getActionCard(`camera_${capability}`)
        .registerRunListener(async (args, state) => {
          await args.device.triggerCapabilityListener(capability, args.value);
        });
    }

    // Apply the same way as in onSettings, but for an individual value
    for (const setting of TuyaOAuth2DriverCamera.SIMPLE_CAMERA_FLOWS.setting) {
      this.homey.flow
        .getActionCard(`camera_${setting}`)
        .registerRunListener(async (args, state) => {
          await args.device
            .sendCommand({ code: setting, value: args.value })
            .catch((err) => {
              if (err.tuyaCode === 2008) {
                throw new Error(
                  this.homey.__("setting_unsupported", { label: TuyaOAuth2DriverCamera.CAMERA_SETTING_LABELS[setting] }),
                );
              } else {
                throw err;
              }
            });
        });
    }
  }

  // Capabilities that are simple commands/statuses
  static SIMPLE_CAMERA_CAPABILITIES = {
    read_write: ["cruise_switch", "siren_switch"],
    read_only: [],
    setting: [
      "motion_switch",
      "decibel_switch",
      "cry_detection_switch",
      "pet_detection",
      "motion_sensitivity",
      "decibel_sensitivity",
      "basic_nightvision",
      "basic_device_volume",
      "basic_anti_flicker",
      "basic_osd",
      "basic_flip",
      "basic_indicator",
      "motion_tracking",
    ],
  };

  // Map from a toggle capability to an alarm capability
  static CAMERA_ALARM_CAPABILITIES = {
    motion_switch: "alarm_motion",
    decibel_switch: "alarm_sound",
    cry_detection_switch: "alarm_crying_child",
    pet_detection: "alarm_pet",
  };

  // Map from an event to an alarm capability
  static CAMERA_ALARM_EVENT_CAPABILITIES = {
    ipc_motion: "alarm_motion",
    ipc_bang: "alarm_sound",
    ipc_baby_cry: "alarm_crying_child",
    ipc_cat: "alarm_pet",
  };

  onTuyaPairListDeviceProperties(device, specification) {
    const props = super.onTuyaPairListDeviceProperties(device);

    const simpleCapabilities = TuyaOAuth2DriverCamera.SIMPLE_CAMERA_CAPABILITIES;

    for (const status of device.status) {
      const capability = status.code;

      // Basic capabilities
      if (
        simpleCapabilities.read_write.includes(capability) ||
        simpleCapabilities.read_only.includes(capability)
      ) {
        props.store.tuya_capabilities.push(capability);
        props.capabilities.push(capability);
      }

      // More complicated capabilities
      if (
        [
          "ptz_control",
          "ptz_stop",
          "zoom_control",
          "zoom_stop",
          "initiative_message",
          "basic_private",
          "wireless_electricity",
        ].includes(capability)
      ) {
        props.store.tuya_capabilities.push(capability);
      }
    }

    // Add battery capacity if supported
    if (props.store.tuya_capabilities.includes("wireless_electricity")) {
      props.capabilities.push("measure_battery");
    }

    // Add privacy mode control if supported
    if (props.store.tuya_capabilities.includes("basic_private")) {
      props.capabilities.push("onoff");
    }

    // Add camera movement control capabilities if supported
    if (
      props.store.tuya_capabilities.includes("ptz_control") &&
      props.store.tuya_capabilities.includes("ptz_stop")
    ) {
      props.capabilities.push("ptz_control_horizontal", "ptz_control_vertical");
    }

    if (
      props.store.tuya_capabilities.includes("zoom_control") &&
      props.store.tuya_capabilities.includes("zoom_stop")
    ) {
      props.capabilities.push("ptz_control_zoom");
    }

    // Add alarm event capabilities if supported, based on the toggles that are available
    // e.g. motion_switch means alarm_motion gets added
    if (props.store.tuya_capabilities.includes("initiative_message")) {
      // Add the alarm capabilities based on the toggles that are available
      const alarmMapping = TuyaOAuth2DriverCamera.CAMERA_ALARM_CAPABILITIES;

      for (const capability of props.store.tuya_capabilities) {
        if (capability in alarmMapping) {
          const alarmCapability = alarmMapping[capability];
          props.capabilities.push(alarmCapability);
        }
      }
    }

    // Match title to other camera alarms
    if (props.capabilities.includes("alarm_motion")) {
      props.capabilitiesOptions["alarm_motion"] = {
        title: {
          en: "Motion Detected",
        },
      };
    }

    return props;
  }
}

module.exports = TuyaOAuth2DriverCamera;
