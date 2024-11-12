import { DEVICE_CATEGORIES } from '../../lib/TuyaOAuth2Constants';
import TuyaOAuth2Driver, { ListDeviceProperties } from '../../lib/TuyaOAuth2Driver';
import {
  type TuyaDeviceDataPointResponse,
  TuyaDeviceResponse,
  TuyaDeviceSpecificationResponse,
} from '../../types/TuyaApiTypes';
import { getFromMap } from '../../lib/TuyaOAuth2Util';
import { HUMIDIFIER_CAPABILITY_MAPPING, HUMIDIFIER_FLOWS } from './TuyaHumidifierConstants';
import driver_compose from './driver.compose.json';
import { StandardDeviceFlowArgs, StandardFlowArgs } from '../../types/TuyaTypes';

module.exports = class TuyaOAuth2DriverHumidifier extends TuyaOAuth2Driver {
  TUYA_DEVICE_CATEGORIES = [DEVICE_CATEGORIES.SMALL_HOME_APPLIANCES.HUMIDIFIER] as const;

  async onInit(): Promise<void> {
    await super.onInit();

    // onoff
    for (const homeyCapability of HUMIDIFIER_FLOWS.onoff) {
      this.homey.flow
        .getActionCard(`humidifier_${homeyCapability}_true`)
        .registerRunListener((args: StandardDeviceFlowArgs) =>
          args.device.triggerCapabilityListener(homeyCapability, true),
        );
      this.homey.flow
        .getActionCard(`humidifier_${homeyCapability}_false`)
        .registerRunListener((args: StandardDeviceFlowArgs) =>
          args.device.triggerCapabilityListener(homeyCapability, false),
        );
      this.homey.flow
        .getConditionCard(`humidifier_${homeyCapability}_is_true`)
        .registerRunListener((args: StandardDeviceFlowArgs) => args.device.getCapabilityValue(homeyCapability));
    }

    // boolean
    for (const homeyCapability of HUMIDIFIER_FLOWS.boolean) {
      this.homey.flow
        .getActionCard(`humidifier_${homeyCapability}`)
        .registerRunListener((args: StandardFlowArgs) =>
          args.device.triggerCapabilityListener(homeyCapability, args.value),
        );
    }

    // enum
    for (const homeyCapability of HUMIDIFIER_FLOWS.enum) {
      this.addEnumActionFlowHandler(homeyCapability, `humidifier_${homeyCapability}`);
    }
  }

  onTuyaPairListDeviceProperties(
    device: TuyaDeviceResponse,
    specifications?: TuyaDeviceSpecificationResponse,
    dataPoints?: TuyaDeviceDataPointResponse,
  ): ListDeviceProperties {
    const props = super.onTuyaPairListDeviceProperties(device, specifications, dataPoints);

    for (const status of device.status) {
      const tuyaCapability = status.code;
      const homeyCapability = getFromMap(HUMIDIFIER_CAPABILITY_MAPPING, tuyaCapability);

      if (homeyCapability) {
        props.store.tuya_capabilities.push(tuyaCapability);
        props.capabilities.push(homeyCapability);
      }
    }

    // Defaults enum values
    props.capabilitiesOptions = { ...props.capabilitiesOptions, ...driver_compose.capabilitiesOptions };

    if (!specifications || !specifications.status) {
      return props;
    }

    for (const statusSpecification of specifications.status) {
      const tuyaCapability = statusSpecification.code;
      const values = JSON.parse(statusSpecification.values);
      const homeyCapability = getFromMap(HUMIDIFIER_CAPABILITY_MAPPING, tuyaCapability);

      if (
        ['mode', 'spray_mode', 'level'].includes(tuyaCapability) &&
        homeyCapability &&
        Array.isArray(values.range) &&
        values.range.length > 0
      ) {
        props.capabilitiesOptions[homeyCapability] = {
          values: values.range.map((value: string) => {
            const title = value.charAt(0).toUpperCase() + value.slice(1);
            return {
              id: value,
              title: title,
            };
          }),
        };
      }
    }

    return props;
  }
};
