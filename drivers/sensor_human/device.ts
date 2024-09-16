import TuyaOAuth2DeviceSensor from '../../lib/TuyaOAuth2DeviceSensor';
import { SettingsEvent, TuyaStatus } from '../../types/TuyaTypes';
import { constIncludes, filterTuyaSettings } from '../../lib/TuyaOAuth2Util';
import * as Util from '../../lib/TuyaOAuth2Util';
import {
  HomeyHumanSensorSettings,
  HUMAN_SENSOR_CAPABILITIES,
  HUMAN_SENSOR_SETTING_LABELS,
  TuyaHumanSensorSettings,
} from './TuyaHumanSensorConstants';

module.exports = class TuyaOAuth2DeviceSensorHuman extends TuyaOAuth2DeviceSensor {
  async onOAuth2Init(): Promise<void> {
    await this.initAlarm('alarm_human').catch(this.error);

    return super.onOAuth2Init();
  }

  async onTuyaStatus(status: TuyaStatus, changedStatusCodes: string[]): Promise<void> {
    await super.onTuyaStatus(status, changedStatusCodes);

    // alarm_human
    if (
      typeof status['presence_state'] === 'string' &&
      (changedStatusCodes.includes('presence_state') || !this.getSetting('use_alarm_timeout'))
    ) {
      this.setAlarmCapabilityValue('alarm_human', status['presence_state'] === 'presence').catch(this.error);
    }

    // Settings
    for (const tuyaCapability in status) {
      const value = status[tuyaCapability];
      if (constIncludes(HUMAN_SENSOR_CAPABILITIES.setting, tuyaCapability)) {
        await this.safeSetSettingValue(tuyaCapability, value);
      }
    }
  }

  async onSettings(event: SettingsEvent<HomeyHumanSensorSettings>): Promise<string | void> {
    const tuyaSettings = filterTuyaSettings<HomeyHumanSensorSettings, TuyaHumanSensorSettings>(event, [
      'sensitivity',
      'near_detection',
      'far_detection',
    ]);

    return Util.onSettings(this, tuyaSettings, HUMAN_SENSOR_SETTING_LABELS);
  }
};
