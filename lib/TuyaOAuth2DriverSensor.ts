import {
  type TuyaDeviceDataPointResponse,
  TuyaDeviceResponse,
  TuyaDeviceSpecificationResponse,
} from '../types/TuyaApiTypes';
import TuyaOAuth2Driver, { ListDeviceProperties } from './TuyaOAuth2Driver';

export default class TuyaOAuth2DriverSensor extends TuyaOAuth2Driver {
  onTuyaPairListDeviceProperties(
    device: TuyaDeviceResponse,
    specifications?: TuyaDeviceSpecificationResponse,
    dataPoints?: TuyaDeviceDataPointResponse,
  ): ListDeviceProperties {
    const props = super.onTuyaPairListDeviceProperties(device, specifications, dataPoints);

    const tuyaCodes = device.status.map(s => s.code);
    const hasBatteryPercentage = tuyaCodes.includes('battery_percentage');

    tuyaCodes.map(tuyaCode => {
      switch (tuyaCode) {
        case 'battery_state':
          if (hasBatteryPercentage) {
            // Do not add battery alarm if percentage is available
            return;
          }

          props.capabilities.push('alarm_battery');
          break;

        case 'battery_percentage':
          props.capabilities.push('measure_battery');
          break;

        case 'temper_alarm':
          props.capabilities.push('alarm_tamper');
          break;

        default:
          // Default return to not add the capability
          return;
      }

      props.store.tuya_capabilities.push(tuyaCode);
    });

    return props;
  }
}

module.exports = TuyaOAuth2DriverSensor;
