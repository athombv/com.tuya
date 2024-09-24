import TuyaOAuth2DeviceSensor from '../../lib/sensor/TuyaOAuth2DeviceSensor';
import { SettingsEvent, TuyaStatus } from '../../types/TuyaTypes';
import { HomeySensorSettings, SENSOR_SETTING_LABELS } from '../../lib/sensor/TuyaSensorConstants';
import * as Util from '../../lib/TuyaOAuth2Util';
import { SENSOR_CO2_CAPABILITY_MAPPING } from './SensorCo2Constants';

module.exports = class TuyaOAuth2DeviceSensorCO2 extends TuyaOAuth2DeviceSensor {
  async onOAuth2Init(): Promise<void> {
    await this.initAlarm('alarm_smoke').catch(this.error);

    return super.onOAuth2Init();
  }

  async onTuyaStatus(status: TuyaStatus, changedStatusCodes: string[]): Promise<void> {
    await super.onTuyaStatus(status, changedStatusCodes);

    for (const tuyaCapability in status) {
      const value = status[tuyaCapability];

      if (
        tuyaCapability === 'co2_state' &&
        (!this.getSetting('use_alarm_timeout') || changedStatusCodes.includes(tuyaCapability))
      ) {
        await this.setAlarmCapabilityValue(SENSOR_CO2_CAPABILITY_MAPPING[tuyaCapability], value === 'alarm').catch(
          this.error,
        );
      }

      if (tuyaCapability === 'co2_value') {
        await this.safeSetCapabilityValue(SENSOR_CO2_CAPABILITY_MAPPING[tuyaCapability], value);
      }
    }
  }

  async onSettings(event: SettingsEvent<HomeySensorSettings>): Promise<string | void> {
    const [unsupportedSettings, unsupportedValues] = await super.onAlarmSettings(event);
    return Util.reportUnsupportedSettings(this, unsupportedSettings, unsupportedValues, SENSOR_SETTING_LABELS);
  }
};
