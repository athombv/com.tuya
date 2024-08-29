import { TuyaStatus } from '../types/TuyaTypes';
import * as TuyaSensorMigrations from '../lib/migrations/TuyaSensorMigrations';
import TuyaTimeOutAlarmDevice from './TuyaTimeOutAlarmDevice';

export default class TuyaOAuth2DeviceSensor extends TuyaTimeOutAlarmDevice {
  async onOAuth2Init(): Promise<void> {
    await this.initAlarm('alarm_tamper', false).catch(this.error);

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

    // alarm_tamper
    if (typeof status['temper_alarm'] === 'boolean') {
      await this.safeSetCapabilityValue('alarm_tamper', status['temper_alarm']);
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
}

module.exports = TuyaOAuth2DeviceSensor;
