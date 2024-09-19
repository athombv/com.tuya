import { DEVICE_CATEGORIES } from '../../lib/TuyaOAuth2Constants';
import TuyaOAuth2Driver, { ListDeviceProperties } from '../../lib/TuyaOAuth2Driver';
import {
  type TuyaDeviceDataPointResponse,
  TuyaDeviceResponse,
  TuyaDeviceSpecificationResponse,
} from '../../types/TuyaApiTypes';
import { FlowCard } from 'homey';
import { StandardDeviceFlowArgs, StandardValueFlowArgs } from '../../types/TuyaTypes';

type SwitchArgs = { switch: { id: string } };

module.exports = class TuyaOAuth2DriverButton extends TuyaOAuth2Driver {
  TUYA_DEVICE_CATEGORIES = [DEVICE_CATEGORIES.ELECTRICAL_PRODUCTS.WIRELESS_SWITCH] as const;

  async onInit(): Promise<void> {
    await super.onInit();

    const switchAutocompleteListener = (
      query: string,
      args: StandardDeviceFlowArgs,
    ): FlowCard.ArgumentAutocompleteResults => {
      const device = args.device;
      const tuyaSwitches = device.getStore().tuya_switches;
      return tuyaSwitches.map((tuyaCapability: string) => {
        const switch_number = tuyaCapability.substring(11);
        const name = this.homey.__('switch', { number: switch_number });
        return {
          name: name,
          id: tuyaCapability,
        };
      });
    };

    for (const trigger of ['pressed', 'clicked', 'double_clicked']) {
      this.homey.flow
        .getDeviceTriggerCard(`button_sub_switch_${trigger}`)
        .registerArgumentAutocompleteListener('switch', (query: string, args: StandardDeviceFlowArgs) =>
          switchAutocompleteListener(query, args),
        )
        .registerRunListener((args: SwitchArgs, state: SwitchArgs) => args.switch.id === state.switch.id);
    }

    this.homey.flow
      .getDeviceTriggerCard('button_knob_turned')
      .registerRunListener((args: StandardValueFlowArgs, state: StandardValueFlowArgs) => args.value === state.value);
  }

  onTuyaPairListDeviceProperties(
    device: TuyaDeviceResponse,
    specifications?: TuyaDeviceSpecificationResponse,
    dataPoints?: TuyaDeviceDataPointResponse,
  ): ListDeviceProperties {
    const props = super.onTuyaPairListDeviceProperties(device, specifications, dataPoints);
    props.store.tuya_switches = [];

    for (const status of device.status) {
      const tuyaCapability = status.code;

      if (tuyaCapability.startsWith('switch_mode')) {
        props.store.tuya_switches.push(tuyaCapability);
        props.store.tuya_capabilities.push(tuyaCapability);
      }

      if (tuyaCapability === 'battery_percentage') {
        props.capabilities.push('measure_battery');
        props.store.tuya_capabilities.push(tuyaCapability);
      }

      if (tuyaCapability === 'knob_switch_mode_1') {
        props.capabilities.push('hidden.knob_switch_mode_1');
        props.store.tuya_capabilities.push(tuyaCapability);
      }
    }

    return props;
  }
};
