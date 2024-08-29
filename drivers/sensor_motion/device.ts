import TuyaOAuth2DeviceSensor from '../../lib/TuyaOAuth2DeviceSensor';
import { TuyaStatus } from '../../types/TuyaTypes';

module.exports = class TuyaOAuth2DeviceSensorMotion extends TuyaOAuth2DeviceSensor {
  async onOAuth2Init(): Promise<void> {
    await this.initAlarm('alarm_motion').catch(this.error);

    return super.onOAuth2Init();
  }

  async onTuyaStatus(status: TuyaStatus, changedStatusCodes: string[]): Promise<void> {
    await super.onTuyaStatus(status, changedStatusCodes);

    // alarm_motion
    if (
      typeof status['pir'] === 'string' &&
      (!this.getSetting('use_alarm_timeout') || changedStatusCodes.includes('pir'))
    ) {
      this.setAlarmCapabilityValue('alarm_motion', status['pir'] === 'pir').catch(this.error);
    }
  }
};
