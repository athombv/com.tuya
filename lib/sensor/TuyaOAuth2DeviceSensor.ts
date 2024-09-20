import { SettingsEvent, TuyaStatus } from '../../types/TuyaTypes';
import * as TuyaSensorMigrations from '../migrations/TuyaSensorMigrations';
import TuyaTimeOutAlarmDevice from '../TuyaTimeOutAlarmDevice';
import * as Util from '../TuyaOAuth2Util';
import { HomeySensorSettings, SENSOR_CAPABILITIES, TuyaSensorSettings } from './TuyaSensorConstants';
import { constIncludes, filterTuyaSettings } from '../TuyaOAuth2Util';

export default class TuyaOAuth2DeviceSensor extends TuyaTimeOutAlarmDevice {
  async onOAuth2Init(): Promise<void> {
    await this.initAlarm('alarm_tamper', false).catch(this.error);

    if (this.hasCapability('onoff.alarm_switch')) {
      this.registerCapabilityListener('onoff.alarm_switch', value => this.sendCommand({ code: 'alarm_switch', value }));
    }

    return super.onOAuth2Init();
  }

  async performMigrations(): Promise<void> {
    await super.performMigrations();
    await TuyaSensorMigrations.performMigrations(this);
  }

  async onTuyaStatus(status: TuyaStatus, changedStatusCodes: string[]): Promise<void> {
    await super.onTuyaStatus(status, changedStatusCodes);

    // alarm_battery
    if (typeof status['battery_state'] === 'string') {
      await this.safeSetCapabilityValue('alarm_battery', status['battery_state'] === 'low');
    }

    // measure_battery
    if (typeof status['battery_percentage'] === 'number') {
      await this.safeSetCapabilityValue('measure_battery', status['battery_percentage']);
    }

    // battery_value
    if (typeof status['battery_value'] === 'number') {
      await this.safeSetCapabilityValue('measure_battery', status['battery_value'] / 300);
    }

    // alarm_tamper
    if (typeof status['temper_alarm'] === 'boolean') {
      await this.safeSetCapabilityValue('alarm_tamper', status['temper_alarm']);
    }

    if (typeof status['alarm_switch'] === 'boolean') {
      await this.safeSetCapabilityValue('onoff.alarm_switch', status['alarm_switch']);
    }

    for (const tuyaCapability in status) {
      if (constIncludes(SENSOR_CAPABILITIES.setting, tuyaCapability)) {
        await this.safeSetSettingValue(tuyaCapability, status[tuyaCapability]);
      }
    }
  }

  async setAlarmCapabilityValue(capability: string, value: boolean): Promise<void> {
    if (this.getSetting('use_alarm_timeout')) {
      if (value) {
        await this.setAlarm(
          capability,
          () => this.setCapabilityValue(capability, true).catch(this.error),
          () => this.setCapabilityValue(capability, false).catch(this.error),
        );
      } else {
        // If the device does send false before the timeout ends we cut it short
        await this.resetAlarm(capability, () => this.setCapabilityValue(capability, false).catch(this.error));
      }
    } else {
      await this.setCapabilityValue(capability, value);
    }
  }

  async onAlarmSettings(
    event: SettingsEvent<HomeySensorSettings>,
  ): Promise<[(keyof TuyaSensorSettings)[], (keyof TuyaSensorSettings)[]]> {
    const tuyaSettings = filterTuyaSettings<HomeySensorSettings, TuyaSensorSettings>(
      event,
      SENSOR_CAPABILITIES.setting,
    );
    return await Util.sendSettings(this, tuyaSettings);
  }
}

module.exports = TuyaOAuth2DeviceSensor;
