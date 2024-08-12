'use strict';

import TuyaOAuth2Driver from './TuyaOAuth2Driver';
import {TuyaDeviceResponse} from "../types/TuyaApiTypes";

export default class TuyaOAuth2DriverSensor extends TuyaOAuth2Driver {

  onTuyaPairListDeviceProperties(device: TuyaDeviceResponse) {
    const props = super.onTuyaPairListDeviceProperties(device);

    // alarm_battery
    const hasBatteryState = device.status.some(({ code }) => code === 'battery_state');
    if (hasBatteryState) {
      props.store!.tuya_capabilities.push('battery_state');
      props.capabilities!.push('alarm_battery');
    }

    return props;
  }

}

module.exports = TuyaOAuth2DriverSensor;
