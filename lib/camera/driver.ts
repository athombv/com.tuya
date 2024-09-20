import { DEVICE_CATEGORIES } from '../TuyaOAuth2Constants';
import TuyaOAuth2Driver, { ListDeviceProperties } from '../TuyaOAuth2Driver';
import { constIncludes, getFromMap } from '../TuyaOAuth2Util';
import {
  type TuyaDeviceDataPointResponse,
  TuyaDeviceResponse,
  TuyaDeviceSpecificationResponse,
} from '../../types/TuyaApiTypes';
import type { StandardFlowArgs } from '../../types/TuyaTypes';
import {
  CAMERA_ALARM_CAPABILITIES,
  CAMERA_SETTING_LABELS,
  COMPLEX_CAMERA_CAPABILITIES,
  SIMPLE_CAMERA_CAPABILITIES,
  SIMPLE_CAMERA_FLOWS,
} from './TuyaCameraConstants';

class TuyaOAuth2DriverWithCamera extends TuyaOAuth2Driver {
  TUYA_DEVICE_CATEGORIES = [DEVICE_CATEGORIES.SECURITY_VIDEO_SURV.SMART_CAMERA] as const;

  async onInit(): Promise<void> {
    await super.onInit();

    for (const capability of SIMPLE_CAMERA_FLOWS.read_write) {
      this.homey.flow.getActionCard(`${this.id}_${capability}`).registerRunListener(async (args: StandardFlowArgs) => {
        await args.device.triggerCapabilityListener(capability, args.value);
      });
    }

    // Apply the same way as in onSettings, but for an individual value
    for (const setting of SIMPLE_CAMERA_FLOWS.setting) {
      this.addSettingFlowHandler(setting, CAMERA_SETTING_LABELS);
    }
  }

  onTuyaPairListDeviceProperties(
    device: TuyaDeviceResponse,
    specifications?: TuyaDeviceSpecificationResponse,
    dataPoints?: TuyaDeviceDataPointResponse,
  ): ListDeviceProperties {
    const props = super.onTuyaPairListDeviceProperties(device, specifications, dataPoints);

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
      if (
        constIncludes(COMPLEX_CAMERA_CAPABILITIES, capability) ||
        constIncludes(SIMPLE_CAMERA_CAPABILITIES.setting, capability)
      ) {
        props.store.tuya_capabilities.push(capability);
      }
    }

    // Add battery capacity if supported
    if (props.store.tuya_capabilities.includes('wireless_electricity')) {
      props.capabilities.push('measure_battery');
    }

    // Add privacy mode control if supported
    if (props.store.tuya_capabilities.includes('basic_private')) {
      props.capabilities.push('onoff');
    }

    // Add camera movement control capabilities if supported
    if (props.store.tuya_capabilities.includes('ptz_control') && props.store.tuya_capabilities.includes('ptz_stop')) {
      props.capabilities.push('ptz_control_horizontal', 'ptz_control_vertical');
    }

    if (props.store.tuya_capabilities.includes('zoom_control') && props.store.tuya_capabilities.includes('zoom_stop')) {
      props.capabilities.push('ptz_control_zoom');
    }

    // Add alarm event capabilities if supported, based on the toggles that are available
    // e.g. motion_switch means alarm_motion gets added
    if (props.store.tuya_capabilities.includes('initiative_message')) {
      // Add the alarm capabilities based on the toggles that are available
      for (const capability of props.store.tuya_capabilities) {
        const alarmCapability = getFromMap(CAMERA_ALARM_CAPABILITIES, capability);
        if (alarmCapability) {
          props.capabilities.push(alarmCapability);
        }
      }
    }

    return props;
  }
}

export default TuyaOAuth2DriverWithCamera;
