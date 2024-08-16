import TuyaOAuth2Device from './TuyaOAuth2Device';

export default class TuyaTimeOutAlarmDevice extends TuyaOAuth2Device {
  alarmTimeouts: Record<string, NodeJS.Timeout | undefined> = {};

  async setAlarm(
    capability: string,
    onAlarmStarted: () => Promise<void>,
    onAlarmEnded: () => Promise<void>,
  ): Promise<void> {
    if (this.alarmTimeouts[capability] !== undefined) {
      // Extend the existing timeout if already running
      clearTimeout(this.alarmTimeouts[capability]);
    } else {
      // Trigger if not
      await onAlarmStarted();
    }
    // Disable the alarm after a set time, since we only get an "on" event
    const alarmTimeout = Math.round((this.getSetting('alarm_timeout') ?? 10) * 1000);
    this.alarmTimeouts[capability] = setTimeout(() => this.resetAlarm(capability, onAlarmEnded), alarmTimeout);
  }

  async resetAlarm(capability: string, onAlarmEnded: () => Promise<void>): Promise<void> {
    // Clear the timeout for the next event
    const currentTimeout = this.alarmTimeouts[capability];
    clearTimeout(currentTimeout);
    this.alarmTimeouts[capability] = undefined;
    await onAlarmEnded();
  }
}
