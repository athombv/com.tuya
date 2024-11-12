import TuyaOAuth2DeviceSensor from '../../lib/sensor/TuyaOAuth2DeviceSensor';
import { TuyaStatus } from '../../types/TuyaTypes';

module.exports = class TuyaOAuth2DeviceSensorVibration extends TuyaOAuth2DeviceSensor {
  async onOAuth2Init(): Promise<void> {
    await this.initAlarm('alarm_vibration').catch(this.error);

    return super.onOAuth2Init();
  }

  async onTuyaStatus(status: TuyaStatus, changedStatusCodes: string[]): Promise<void> {
    await super.onTuyaStatus(status, changedStatusCodes);

    for (const tuyaCapability in status) {
      const value = status[tuyaCapability];
      if (
        tuyaCapability === 'shock_state' &&
        (!this.getSetting('use_alarm_timeout') || changedStatusCodes.includes(tuyaCapability))
      ) {
        this.setAlarmCapabilityValue('alarm_vibration', value !== 'normal').catch(this.error);
      }
    }
  }
};
