import { TuyaDeviceResponse, TuyaDeviceSpecificationResponse } from '../types/TuyaApiTypes';
import TuyaOAuth2Driver, { ListDeviceProperties } from './TuyaOAuth2Driver';

export default class TuyaOAuth2DriverSensor extends TuyaOAuth2Driver {
  onTuyaPairListDeviceProperties(
    device: TuyaDeviceResponse,
    specifications: TuyaDeviceSpecificationResponse, // eslint-disable-line @typescript-eslint/no-unused-vars
  ): ListDeviceProperties {
    const props = super.onTuyaPairListDeviceProperties(device);

    // alarm_battery
    const hasBatteryState = device.status.some(({ code }) => code === 'battery_state');
    if (hasBatteryState) {
      props.store?.tuya_capabilities.push('battery_state');
      props.capabilities?.push('alarm_battery');
    }

    return props;
  }
}

module.exports = TuyaOAuth2DriverSensor;
