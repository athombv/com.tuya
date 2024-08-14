import TuyaOAuth2Driver from '../../lib/TuyaOAuth2Driver';
import TuyaOAuth2DeviceHeater from "./device";
import {TuyaDeviceResponse, TuyaDeviceSpecificationResponse} from "../../types/TuyaApiTypes";
import {DEVICE_CATEGORIES} from "../../lib/TuyaOAuth2Constants";
import {HEATER_CAPABILITIES_MAPPING} from "./TuyaHeaterConstants";

type DeviceArgs = { device: TuyaOAuth2DeviceHeater };
type ValueArgs = { value: any };

export default class TuyaOAuth2DriverHeater extends TuyaOAuth2Driver {

  TUYA_DEVICE_CATEGORIES = [
    DEVICE_CATEGORIES.SMALL_HOME_APPLIANCES.HEATER,
  ] as const;

  async onInit() {
    await super.onInit();

    this.homey.flow
      .getActionCard("heater_set_child_lock")
      .registerRunListener(async (args: DeviceArgs & ValueArgs) => {
        await args.device.triggerCapabilityListener("child_lock", args.value);
      });

    this.homey.flow
      .getActionCard("heater_set_eco_mode")
      .registerRunListener(async (args: DeviceArgs & ValueArgs) => {
        await args.device.triggerCapabilityListener("eco_mode", args.value);
      });
  }

  onTuyaPairListDeviceProperties(device: TuyaDeviceResponse, specification: TuyaDeviceSpecificationResponse) {
    const props = super.onTuyaPairListDeviceProperties(device, specification);

    for (const status of device.status) {
      const tuyaCapability = status.code;

      if (tuyaCapability in HEATER_CAPABILITIES_MAPPING) {
        props.store.tuya_capabilities.push(tuyaCapability);

        const homeyCapability = HEATER_CAPABILITIES_MAPPING[tuyaCapability as keyof typeof HEATER_CAPABILITIES_MAPPING];
        props.capabilities.push(homeyCapability);
      }
    }

    if (!specification || !specification.functions) {
      return props;
    }

    for (const functionSpecification of specification.functions) {
      if (functionSpecification.code === 'temp_set') {
        const tempSetSpecs = JSON.parse(functionSpecification.values);
        props.capabilitiesOptions['target_temperature'] = {
          step: tempSetSpecs.step,
          min: tempSetSpecs.min,
          max: tempSetSpecs.max,
        };
      }
    }

    return props;
  }

}
