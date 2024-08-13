"use strict";

import TuyaOAuth2Driver from "../../lib/TuyaOAuth2Driver";
import TuyaOAuth2DeviceCamera from "./device";
import {TuyaDeviceResponse, TuyaDeviceSpecificationResponse} from "../../types/TuyaApiTypes";
import TuyaOAuth2Constants from "../../lib/TuyaOAuth2Constants";
import TuyaCameraConstants from "./TuyaCameraConstants";
import {constIncludes} from "../../lib/TuyaOAuth2Util";
const {
  CAMERA_SETTING_LABELS,
  SIMPLE_CAMERA_FLOWS,
  SIMPLE_CAMERA_CAPABILITIES,
  COMPLEX_CAMERA_CAPABILITIES,
  CAMERA_ALARM_CAPABILITIES,
} = TuyaCameraConstants;

type DeviceArgs = { device: TuyaOAuth2DeviceCamera };
type ValueArgs = { value: any };

class TuyaOAuth2DriverCamera extends TuyaOAuth2Driver {
  TUYA_DEVICE_CATEGORIES = [
    TuyaOAuth2Constants.DEVICE_CATEGORIES.SECURITY_VIDEO_SURV.SMART_CAMERA,
  ];

  async onInit() {
    await super.onInit();

    for (const capability of SIMPLE_CAMERA_FLOWS.read_write) {
      this.homey.flow
        .getActionCard(`camera_${capability}`)
        .registerRunListener(async (args: DeviceArgs & ValueArgs) => {
          await args.device.triggerCapabilityListener(capability, args.value);
        });
    }

    // Apply the same way as in onSettings, but for an individual value
    for (const setting of SIMPLE_CAMERA_FLOWS.setting) {
      this.homey.flow
        .getActionCard(`camera_${setting}`)
        .registerRunListener(async (args: DeviceArgs & ValueArgs) => {
          await args.device
            .sendCommand({code: setting, value: args.value})
            .catch((err) => {
              if (err.tuyaCode === 2008) {
                throw new Error(this.homey.__("setting_unsupported", {label: CAMERA_SETTING_LABELS[setting]}));
              } else {
                throw err;
              }
            });
        });
    }
  }

  onTuyaPairListDeviceProperties(device: TuyaDeviceResponse, specifications: TuyaDeviceSpecificationResponse) {
    const props = super.onTuyaPairListDeviceProperties(device, specifications);

    for (const status of device.status) {
      const capability = status.code;

      // Basic capabilities
      if (
        constIncludes(SIMPLE_CAMERA_CAPABILITIES.read_write, capability) ||
        constIncludes(SIMPLE_CAMERA_CAPABILITIES.read_only, capability)
      ) {
        props.store.tuya_capabilities.push(capability);
        props.capabilities.push(capability);
      }

      // More complicated capabilities
      if (constIncludes(COMPLEX_CAMERA_CAPABILITIES, capability)) {
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
      for (const capability of props.store.tuya_capabilities) {
        if (capability in CAMERA_ALARM_CAPABILITIES) {
          const alarmCapability = CAMERA_ALARM_CAPABILITIES[capability as keyof typeof CAMERA_ALARM_CAPABILITIES];
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
