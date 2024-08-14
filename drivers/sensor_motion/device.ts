import TuyaOAuth2DeviceSensor from '../../lib/TuyaOAuth2DeviceSensor';
import { TuyaStatus } from '../../types/TuyaTypes';

module.exports = class TuyaOAuth2DeviceSensorMotion extends TuyaOAuth2DeviceSensor {
  async onTuyaStatus(status: TuyaStatus, changedStatusCodes: string[]): Promise<void> {
    await super.onTuyaStatus(status, changedStatusCodes);

    // alarm_motion
    if (typeof status['pir'] === 'string') {
      this.setCapabilityValue('alarm_motion', status['pir'] === 'pir').catch(this.error);
    }
  }
};
