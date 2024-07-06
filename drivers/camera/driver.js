"use strict";

const TuyaOAuth2Driver = require("../../lib/TuyaOAuth2Driver");
const TuyaOAuth2Constants = require("../../lib/TuyaOAuth2Constants");

class TuyaOAuth2DriverCamera extends TuyaOAuth2Driver {
  static TUYA_DEVICE_CATEGORIES = [
    TuyaOAuth2Constants.DEVICE_CATEGORIES.SECURITY_VIDEO_SURV.SMART_CAMERA,
  ];

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

    for (const capability of TuyaOAuth2DriverCamera.SIMPLE_CAMERA_FLOWS
      .read_write) {
      this.homey.flow
        .getActionCard(`camera_${capability}`)
        .registerRunListener(async (args, state) => {
          await args.device.triggerCapabilityListener(capability, args.value);
        });
    }

    for (const setting of TuyaOAuth2DriverCamera.SIMPLE_CAMERA_FLOWS.setting) {
      this.homey.flow
        .getActionCard(`camera_${setting}`)
        .registerRunListener(async (args, state) => {
          await args.device
            .sendCommand({
              code: setting,
              value: args.value,
            })
            .catch((err) => {
              if (err.tuyaCode === 2008) {
                // TODO make translatable
                const label =
                  TuyaOAuth2DriverCamera.CAMERA_SETTING_LABELS[setting];
                throw new Error(`${label} is not supported by the device`);
              } else {
                throw err;
              }
            });
        });
    }
  }

  /* Read/Write properties:
     - ipc_work_mode         Working mode   Enum   {“range”:[“0”,“1”]}
     + basic_device_volume   Volume control   Integer   {“min”:1,“max”:10,“scale”:0,“step”:1}
     - floodlight_lightness  Floodlight brightness   Integer   {“min”:1,“max”:100,“scale”:0,“step”:1}
     - wireless_batterylock  Battery lock   Boolean   {}
     + siren_switch          Siren   Boolean   {}
     + zoom_stop             Stop zooming   Boolean   {}
     + cry_detection_switch  Cry detection   Boolean   {}
     + decibel_switch        Sound detection alarm switch   Boolean   {}
     - record_switch         SD card video recording switch   Boolean   {}
     - motion_record         SD card video recording mode   Boolean   {}
     - sd_umount             Unmount the SD card   Boolean   {}
     - sd_format             SD card formatting   Boolean   {}
     - device_restart        Remote restart   Boolean   {}
     + basic_indicator       Status indicator light   Boolean   {}
     + basic_private         Privacy mode   Boolean   {}
     + basic_flip            Flip   Boolean   {}
     + basic_osd             Time watermark   Boolean   {}
     - basic_wdr             Wide dynamic range (WDR) mode   Boolean   {}
     - basic_shimmer         Shimmer full color   Boolean   {}
     - ptz_calibration       PTZ calibration   Boolean   {}
     + ptz_stop              Stop PTZ   Boolean   {}
     + cruise_switch         Cruise switch   Boolean   {}
     + motion_tracking       Motion tracking   Boolean   {}
     + motion_switch         Motion alarm switch   Boolean   {}
     - motion_timer_switch   Motion detection mode selection   Boolean   {}
     - flight_warn_switch    Warning switch   Boolean   {}
     - flight_pir_a          PIR sensor 1   Boolean   {}
     - flight_pir_b          PIR sensor 2   Boolean   {}
     - flight_pir_c          PIR sensor 3   Boolean   {}
     - floodlight_switch     Floodlight   Boolean   {}
     + zoom_control          Zoom control   Enum   {“range”:[“0”,“1”]}
     + decibel_sensitivity   Sound detection sensitivity   Enum   {“range”:[“0”,“1”]}
     - record_mode           Video recording mode   Enum   {“range”:[“1”,“2”]}
     + basic_nightvision     IR night vision   Enum   {“range”:[“0”,“1”,“2”]}
     + basic_anti_flicker    Anti-flicker   Enum   {“range”:[“0”,“1”,“2”]}
     + ptz_control           PTZ control   Enum   {“range”:[“0”,“1”,“2”,“3”,“4”,“5”,“6”,“7”]}
     - motion_interval       Alarm interval   Enum   {“range”:[“1”,“3”,“5”]}
     + motion_sensitivity    Motion detection sensitivity   Enum   {“range”:[“0”,“1”,“2”]}
     - flight_bright_mode    Brightness mode   Enum   {“range”:[“0”,“1”]}
     - pir_sensitivity       PIR sensitivity   Enum   {“range”:[“0”,“1”,“2”]}
   */

  /* Read-only properties:
     - wireless_electricity  Battery capacity   Integer   {“min”:0,“max”:100,“scale”:0,“step”:1}
     - wireless_powermode    Power supply       Enum      {“range”:[“0”,“1”]}
     - sensor_humidity       Humidity           Integer   {“min”:0,“max”:100,“scale”:0,“step”:1}
     - sensor_temperature    Temperature        Integer   {“min”:0,“max”:50,“scale”:0,“step”:1}
     - sd_format_state       Formatting status  Integer   {“min”:-20000,“max”:100,“scale”:0,“step”:1}
     - sd_status             SD card status     Integer   {“min”:1,“max”:5,“scale”:0,“step”:1}
     - sd_storge             SD card capacity   String    {“maxlen”:255}
   */

  /* Unclear properties:
     https://developer.tuya.com/en/docs/app-development/ptzcontrol?id=Ka6nxw2ky6knr#title-19-Auto-patrol%20mode
     - cruise_mode > Mentioned in above documentation to switch between panoramic and user defined sites.
     - cruise_time_mode > Mentioned in above documentation to switch between all-day and user defined times.
     https://developer.tuya.com/en/docs/app-development/ptzcontrol?id=Ka6nxw2ky6knr#title-23-Preset%20points
     - ipc_preset_set > unclear from documentation and testing what this does. Might be related to user defined sites.
   */

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

    const simpleCapabilities =
      TuyaOAuth2DriverCamera.SIMPLE_CAMERA_CAPABILITIES;

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
        ]
      ) {
        props.store.tuya_capabilities.push(capability);
      }
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
