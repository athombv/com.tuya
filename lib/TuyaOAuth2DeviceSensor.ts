import TuyaOAuth2Device from './TuyaOAuth2Device';
import {TuyaStatus} from "../types/TuyaTypes";

export default class TuyaOAuth2DeviceSensor extends TuyaOAuth2Device {

  async onTuyaStatus(status: TuyaStatus, changedStatusCodes: string[]) {
    await super.onTuyaStatus(status, changedStatusCodes);

    // alarm_battery
    if (typeof status['battery_state'] === 'string') {
      super.setCapabilityValue('alarm_battery', status['battery_state'] === 'low').catch(this.error);
    }
  }

}

module.exports = TuyaOAuth2DeviceSensor;
