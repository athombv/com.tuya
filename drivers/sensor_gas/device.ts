import TuyaOAuth2DeviceSensor from '../../lib/sensor/TuyaOAuth2DeviceSensor';
import { SettingsEvent, TuyaStatus } from '../../types/TuyaTypes';
import { HomeySensorSettings, SENSOR_SETTING_LABELS } from '../../lib/sensor/TuyaSensorConstants';
import * as Util from '../../lib/TuyaOAuth2Util';
import { SENSOR_GAS_CAPABILITY_MAPPING } from './SensorGasConstants';
import { getFromMap } from '../../lib/TuyaOAuth2Util';

module.exports = class TuyaOAuth2DeviceSensorGas extends TuyaOAuth2DeviceSensor {
  async onOAuth2Init(): Promise<void> {
    await this.initAlarm('alarm_gas').catch(this.error);
    await this.initAlarm('alarm_co').catch(this.error);

    return super.onOAuth2Init();
  }

  async onTuyaStatus(status: TuyaStatus, changedStatusCodes: string[]): Promise<void> {
    await super.onTuyaStatus(status, changedStatusCodes);

    for (const tuyaCapability in status) {
      const value = status[tuyaCapability];
      const homeyCapability = getFromMap(SENSOR_GAS_CAPABILITY_MAPPING, tuyaCapability);

      if (
        (tuyaCapability === 'gas_sensor_status' || tuyaCapability === 'co_state') &&
        homeyCapability &&
        (!this.getSetting('use_alarm_timeout') || changedStatusCodes.includes(tuyaCapability))
      ) {
        await this.setAlarmCapabilityValue(homeyCapability, value === 'alarm').catch(this.error);
      }

      if (
        tuyaCapability === 'gas_sensor_state' &&
        homeyCapability &&
        (!this.getSetting('use_alarm_timeout') || changedStatusCodes.includes(tuyaCapability))
      ) {
        await this.setAlarmCapabilityValue(homeyCapability, value === '1').catch(this.error);
      }

      if (['gas_sensor_value', 'co_value'].includes(tuyaCapability)) {
        await this.safeSetCapabilityValue(homeyCapability, value);
      }

      if (homeyCapability === 'measure_gas') {
        await this.homey.flow
          .getDeviceTriggerCard(`sensor_gas_${homeyCapability}_changed`)
          .trigger(this, { value })
          .catch(this.error);
      }
    }
  }

  async onSettings(event: SettingsEvent<HomeySensorSettings>): Promise<string | void> {
    const [unsupportedSettings, unsupportedValues] = await super.onAlarmSettings(event);
    return Util.reportUnsupportedSettings(this, unsupportedSettings, unsupportedValues, SENSOR_SETTING_LABELS);
  }
};
