'use strict';

import TuyaOAuth2DeviceSensor from '../../lib/TuyaOAuth2DeviceSensor';
import {TuyaStatus} from "../../types/TuyaTypes";

export default class TuyaOAuth2DeviceSensorMotion extends TuyaOAuth2DeviceSensor {

  async onTuyaStatus(status: TuyaStatus, changedStatusCodes: string[]) {
    await super.onTuyaStatus(status, changedStatusCodes);

    // alarm_motion
    if (typeof status['pir'] === 'string') {
      this.setCapabilityValue('alarm_motion', status['pir'] === 'pir').catch(this.error);
    }
  }

}

module.exports = TuyaOAuth2DeviceSensorMotion;
