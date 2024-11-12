import TuyaOAuth2DeviceSensor from '../../lib/sensor/TuyaOAuth2DeviceSensor';
import { SettingsEvent, TuyaStatus } from '../../types/TuyaTypes';
import { HomeySensorSettings, SENSOR_SETTING_LABELS } from '../../lib/sensor/TuyaSensorConstants';
import * as Util from '../../lib/TuyaOAuth2Util';
import {
  HomeyPM25SensorSettings,
  SENSOR_PM25_CAPABILITIES,
  SENSOR_PM25_CAPABILITY_MAPPING,
} from './SensorPm25Constants';
import { constIncludes, getFromMap } from '../../lib/TuyaOAuth2Util';

module.exports = class TuyaOAuth2DeviceSensorPM25 extends TuyaOAuth2DeviceSensor {
  async onOAuth2Init(): Promise<void> {
    await this.initAlarm('alarm_pm25').catch(this.error);
    return super.onOAuth2Init();
  }

  async onTuyaStatus(status: TuyaStatus, changedStatusCodes: string[]): Promise<void> {
    await super.onTuyaStatus(status, changedStatusCodes);

    for (const tuyaCapability in status) {
      const value = status[tuyaCapability];
      const homeyCapability = getFromMap(SENSOR_PM25_CAPABILITY_MAPPING, tuyaCapability);

      if (
        tuyaCapability === 'pm25_state' &&
        (!this.getSetting('use_alarm_timeout') || changedStatusCodes.includes(tuyaCapability))
      ) {
        await this.setAlarmCapabilityValue(SENSOR_PM25_CAPABILITY_MAPPING[tuyaCapability], value === 'alarm').catch(
          this.error,
        );
      }

      if (constIncludes(SENSOR_PM25_CAPABILITIES.read_only, tuyaCapability) && homeyCapability) {
        await this.safeSetCapabilityValue(homeyCapability, value);
      }

      if (constIncludes(SENSOR_PM25_CAPABILITIES.read_only_scaled, tuyaCapability) && homeyCapability) {
        const scaling = 10.0 ** Number.parseInt(this.getSetting(`${homeyCapability}_scaling`) ?? '0', 10);
        await this.safeSetCapabilityValue(homeyCapability, (status[tuyaCapability] as number) / scaling);
      }
    }
  }

  async onSettings(event: SettingsEvent<HomeyPM25SensorSettings>): Promise<string | void> {
    for (const tuyaCapability of SENSOR_PM25_CAPABILITIES.read_only_scaled) {
      const homeyCapability = SENSOR_PM25_CAPABILITY_MAPPING[tuyaCapability];
      await Util.handleScaleSetting(this, event, `${homeyCapability}_scaling`, homeyCapability);
    }

    const [unsupportedSettings, unsupportedValues] = await super.onAlarmSettings(
      event as unknown as SettingsEvent<HomeySensorSettings>,
    );
    return Util.reportUnsupportedSettings(this, unsupportedSettings, unsupportedValues, SENSOR_SETTING_LABELS);
  }
};
