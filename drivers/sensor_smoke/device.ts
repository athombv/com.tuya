import TuyaOAuth2DeviceSensor from '../../lib/TuyaOAuth2DeviceSensor';
import {TuyaStatus} from "../../types/TuyaTypes";

export default class TuyaOAuth2DeviceSensorSmoke extends TuyaOAuth2DeviceSensor {

  async onTuyaStatus(status: TuyaStatus, changedStatusCodes: string[]) {
    await super.onTuyaStatus(status, changedStatusCodes);

    // alarm_smoke
    if (typeof status['smoke_sensor_status'] === 'string') {
      this.setCapabilityValue('alarm_smoke', status['smoke_sensor_status'] === 'alarm').catch(this.error);
    }
  }

}

module.exports = TuyaOAuth2DeviceSensorSmoke;
