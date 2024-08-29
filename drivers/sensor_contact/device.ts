import TuyaOAuth2DeviceSensor from '../../lib/TuyaOAuth2DeviceSensor';
import { TuyaStatus } from '../../types/TuyaTypes';

module.exports = class TuyaOAuth2DeviceSensorContact extends TuyaOAuth2DeviceSensor {
  async onOAuth2Init(): Promise<void> {
    await this.initAlarm('alarm_contact').catch(this.error);

    return super.onOAuth2Init();
  }

  async onTuyaStatus(status: TuyaStatus, changedStatusCodes: string[]): Promise<void> {
    await super.onTuyaStatus(status, changedStatusCodes);

    // alarm_contact
    if (
      typeof status['doorcontact_state'] === 'boolean' &&
      (!this.getSetting('use_alarm_timeout') || changedStatusCodes.includes('doorcontact_state'))
    ) {
      this.setAlarmCapabilityValue('alarm_contact', status['doorcontact_state']).catch(this.error);
    }
  }
};
