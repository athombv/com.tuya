'use strict';

class TuyaCamera {
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

  // Tuya capabilities that cannot simply be added as Homey capabilities of the same name
  static COMPLEX_CAMERA_CAPABILITIES = [
    "ptz_control",
    "ptz_stop",
    "zoom_control",
    "zoom_stop",
    "initiative_message",
    "basic_private",
    "wireless_electricity",
  ];

  // Flows that can be added with the prefix 'camera_'
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
}

module.exports = TuyaCamera;
