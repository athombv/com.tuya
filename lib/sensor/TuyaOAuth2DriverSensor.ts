import {
  type TuyaDeviceDataPointResponse,
  TuyaDeviceResponse,
  TuyaDeviceSpecificationResponse,
} from '../../types/TuyaApiTypes';
import TuyaOAuth2Driver, { ListDeviceProperties } from '../TuyaOAuth2Driver';
import { SENSOR_CAPABILITIES, SENSOR_CAPABILITY_MAPPING } from './TuyaSensorConstants';
import { constIncludes, getFromMap } from '../TuyaOAuth2Util';

export default class TuyaOAuth2DriverSensor extends TuyaOAuth2Driver {
  onTuyaPairListDeviceProperties(
    device: TuyaDeviceResponse,
    specifications?: TuyaDeviceSpecificationResponse,
    dataPoints?: TuyaDeviceDataPointResponse,
  ): ListDeviceProperties {
    const props = super.onTuyaPairListDeviceProperties(device, specifications, dataPoints);

    const tuyaCodes = device.status.map(s => s.code);
    const hasBatteryPercentage = tuyaCodes.includes('battery_percentage') || tuyaCodes.includes('battery_value');

    for (const tuyaCapability of tuyaCodes) {
      const homeyCapability = getFromMap(SENSOR_CAPABILITY_MAPPING, tuyaCapability);
      if (tuyaCapability === 'battery_state' && homeyCapability) {
        if (hasBatteryPercentage) {
          // Do not add battery alarm if percentage is available
          continue;
        }
        props.capabilities.push(homeyCapability);
        props.store.tuya_capabilities.push(tuyaCapability);
      }
      if (homeyCapability) {
        props.capabilities.push(homeyCapability);
        props.store.tuya_capabilities.push(tuyaCapability);
      }
      if (constIncludes(SENSOR_CAPABILITIES.setting, tuyaCapability)) {
        props.capabilities.push(`hidden.${tuyaCapability}`);
        props.store.tuya_capabilities.push(tuyaCapability);
      }
    }

    const existingMigrations = props.store['_migrations'] ?? [];
    props.store['_migrations'] = [
      ...existingMigrations,
      'sensor_battery_percentage',
      'sensor_temper_alarm',
      'sensor_alarm_settings',
    ];

    return props;
  }
}

module.exports = TuyaOAuth2DriverSensor;
