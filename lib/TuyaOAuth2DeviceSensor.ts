import { TuyaStatus } from '../types/TuyaTypes';
import TuyaOAuth2Device from './TuyaOAuth2Device';
import * as TuyaSensorMigrations from '../lib/migrations/TuyaSensorMigrations';

export default class TuyaOAuth2DeviceSensor extends TuyaOAuth2Device {
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
}

module.exports = TuyaOAuth2DeviceSensor;
