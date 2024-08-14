import TuyaOAuth2DeviceSensor from '../../lib/TuyaOAuth2DeviceSensor';
import {TuyaStatus} from "../../types/TuyaTypes";

export default class TuyaOAuth2DeviceSensorContact extends TuyaOAuth2DeviceSensor {

  async onTuyaStatus(status: TuyaStatus, changedStatusCodes: string[]) {
    await super.onTuyaStatus(status, changedStatusCodes);

    // alarm_contact
    if (typeof status['doorcontact_state'] === 'boolean') {
      this.setCapabilityValue('alarm_contact', status['doorcontact_state']).catch(this.error);
    }
  }

}

module.exports = TuyaOAuth2DeviceSensorContact;
