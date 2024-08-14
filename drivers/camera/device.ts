import TuyaOAuth2Device from '../../lib/TuyaOAuth2Device';
import {
  CAMERA_ALARM_EVENT_CAPABILITIES,
  CAMERA_SETTING_LABELS,
  SIMPLE_CAMERA_CAPABILITIES,
} from './TuyaCameraConstants';
import * as TuyaOAuth2Util from '../../lib/TuyaOAuth2Util';
import { constIncludes } from '../../lib/TuyaOAuth2Util';
import { SettingsEvent, TuyaStatus } from '../../types/TuyaTypes';

module.exports = class TuyaOAuth2DeviceCamera extends TuyaOAuth2Device {
  alarmTimeouts: Record<string, NodeJS.Timeout | undefined> = {};

  async onOAuth2Init(): Promise<void> {
    await super.onOAuth2Init();

    for (const capability of this.getCapabilities()) {
      // Basic capabilities
      if (constIncludes(SIMPLE_CAMERA_CAPABILITIES.read_write, capability)) {
        this.registerCapabilityListener(capability, value =>
          this.sendCommand({
            code: capability,
            value: value,
          }),
        );
      }

      // PTZ control
      if (capability === 'ptz_control_vertical') {
        this.registerCapabilityListener(capability, value => this.ptzCapabilityListener(value, '0', '4'));
      }
      if (capability === 'ptz_control_horizontal') {
        this.registerCapabilityListener(capability, value => this.ptzCapabilityListener(value, '6', '2'));
      }

      if (capability === 'ptz_control_zoom') {
        this.registerCapabilityListener(capability, value => this.zoomCapabilityListener(value));
      }

      // Other capabilities
      if (capability === 'onoff') {
        this.registerCapabilityListener(capability, value =>
          this.sendCommand({
            code: 'basic_private',
            value: !value,
          }),
        );
      }
    }

    // Reset alarms in case a timeout was interrupted
    for (const tuyaCapability in CAMERA_ALARM_EVENT_CAPABILITIES) {
      const capability =
        CAMERA_ALARM_EVENT_CAPABILITIES[tuyaCapability as keyof typeof CAMERA_ALARM_EVENT_CAPABILITIES];
      if (this.hasCapability(capability)) {
        await this.setCapabilityValue(capability, false);
      }
    }
  }

  async onTuyaStatus(status: TuyaStatus, changed: string[]): Promise<void> {
    await super.onTuyaStatus(status, changed);

    for (const statusKey in status) {
      const value = status[statusKey];

      // Basic capabilities
      if (
        constIncludes(SIMPLE_CAMERA_CAPABILITIES.read_write, statusKey) ||
        constIncludes(SIMPLE_CAMERA_CAPABILITIES.read_only, statusKey)
      ) {
        await this.setCapabilityValue(statusKey, value).catch(this.error);
      }

      if (constIncludes(SIMPLE_CAMERA_CAPABILITIES.setting, statusKey)) {
        await this.setSettings({
          [statusKey]: value,
        }).catch(this.error);
      }

      // PTZ control
      if (
        (statusKey === 'ptz_stop' && value && changed.includes('ptz_stop')) ||
        (statusKey === 'ptz_control' && value === '8' && changed.includes('ptz_control'))
      ) {
        await this.setCapabilityValue('ptz_control_horizontal', 'idle').catch(this.error);
        await this.setCapabilityValue('ptz_control_vertical', 'idle').catch(this.error);
      }

      if (statusKey === 'zoom_stop' && value && changed.includes('zoom_stop')) {
        await this.setCapabilityValue('ptz_control_zoom', 'idle').catch(this.error);
      }

      // Other capabilities
      if (statusKey === 'basic_private') {
        await this.setCapabilityValue('onoff', !value).catch(this.error);
      }

      if (statusKey === 'wireless_electricity') {
        await this.setCapabilityValue('measure_battery', value).catch(this.error);
      }

      // Event messages
      if (statusKey === 'initiative_message' && changed.includes('initiative_message')) {
        // Event messages are base64 encoded JSON
        const encoded = status[statusKey] as string;
        const decoded = Buffer.from(encoded, 'base64');
        const data = JSON.parse(decoded.toString());
        const notificationType = data.cmd;
        const dataType = data.type;
        this.log('Notification:', notificationType, dataType);

        // Check if the event is for a known alarm
        if (notificationType in CAMERA_ALARM_EVENT_CAPABILITIES) {
          const alarmCapability =
            CAMERA_ALARM_EVENT_CAPABILITIES[notificationType as keyof typeof CAMERA_ALARM_EVENT_CAPABILITIES];
          if (!this.hasCapability(alarmCapability)) {
            await this.addCapability(alarmCapability).catch(this.error);
          }
          await this.setAlarm(alarmCapability);
        }
      }
    }
  }

  async setAlarm(capability: string): Promise<void> {
    if (this.alarmTimeouts[capability] !== undefined) {
      // Extend the existing timeout if already running
      clearTimeout(this.alarmTimeouts[capability]);
    } else {
      // Trigger capability change if not
      const deviceTriggerCard = this.homey.flow.getDeviceTriggerCard(`camera_${capability}_true`);
      await deviceTriggerCard.trigger(this).catch(this.error);
      await this.setCapabilityValue(capability, true).catch(this.error);
    }
    // Disable the alarm after a set time, since we only get an "on" event
    const alarmTimeout = Math.round((this.getSetting('alarm_timeout') ?? 10) * 1000);
    this.alarmTimeouts[capability] = setTimeout(() => this.resetAlarm(capability), alarmTimeout);
  }

  async resetAlarm(capability: string): Promise<void> {
    // Clear the timeout for the next event
    const currentTimeout = this.alarmTimeouts[capability];
    clearTimeout(currentTimeout);
    this.alarmTimeouts[capability] = undefined;
    // Trigger capability change
    const deviceTriggerCard = this.homey.flow.getDeviceTriggerCard(`camera_${capability}_false`);
    await deviceTriggerCard.trigger(this).catch(this.error);
    await this.setCapabilityValue(capability, false).catch(this.error);
  }

  // Map from up/idle/down to commands so the ternary UI shows arrows
  async ptzCapabilityListener(value: 'up' | 'idle' | 'down', up: string, down: string): Promise<void> {
    if (value === 'idle') {
      await this.sendCommand({ code: 'ptz_stop', value: true });
    } else {
      await this.sendCommand({ code: 'ptz_control', value: value === 'up' ? up : down });
    }
  }

  async zoomCapabilityListener(value: 'up' | 'idle' | 'down'): Promise<void> {
    if (value === 'idle') {
      await this.sendCommand({ code: 'zoom_stop', value: true });
    } else {
      await this.sendCommand({ code: 'zoom_control', value: value === 'up' ? '1' : '0' });
    }
  }

  async onSettings(event: SettingsEvent<any>): Promise<string | void> {
    return await TuyaOAuth2Util.onSettings(this, event, CAMERA_SETTING_LABELS);
  }
};
