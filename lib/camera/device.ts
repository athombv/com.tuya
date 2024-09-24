import * as TuyaOAuth2Util from '../TuyaOAuth2Util';
import { constIncludes, getFromMap } from '../TuyaOAuth2Util';
import { SettingsEvent, TuyaStatus } from '../../types/TuyaTypes';
import {
  CAMERA_ALARM_EVENT_CAPABILITIES,
  CAMERA_SETTING_LABELS,
  HomeyCameraSettings,
  SIMPLE_CAMERA_CAPABILITIES,
  TuyaCameraSettings,
} from './TuyaCameraConstants';
import TuyaTimeOutAlarmDevice from '../TuyaTimeOutAlarmDevice';
import { EventEvent } from '../webhooks/TuyaWebhookParser';

abstract class TuyaOAuth2DeviceWithCamera extends TuyaTimeOutAlarmDevice {
  abstract DOORBELL_TRIGGER_FLOW: string;

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
      const capability = getFromMap(CAMERA_ALARM_EVENT_CAPABILITIES, tuyaCapability);
      if (capability && this.hasCapability(capability)) {
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
      if (statusKey === 'event_message' && changed.includes('event_message')) {
        const event_message = value as EventEvent['data'];
        if (event_message.etype === 'ac_doorbell') {
          if (!this.hasCapability('hidden.doorbell')) {
            await this.addCapability('hidden.doorbell').catch(this.error);
          } else {
            await this.homey.flow.getDeviceTriggerCard(this.DOORBELL_TRIGGER_FLOW).trigger(this).catch(this.error);
          }
        }
      }

      if (statusKey === 'initiative_message' && changed.includes('initiative_message')) {
        // Event messages are base64 encoded JSON
        const encoded = status[statusKey] as string;
        const decoded = Buffer.from(encoded, 'base64');
        const data = JSON.parse(decoded.toString());
        const notificationType = data.cmd;
        const dataType = data.type;
        this.log('Initiative message:', notificationType, dataType);

        // Check if the event is for a known alarm
        if (notificationType in CAMERA_ALARM_EVENT_CAPABILITIES) {
          const alarmCapability = getFromMap(CAMERA_ALARM_EVENT_CAPABILITIES, notificationType);
          if (!alarmCapability) {
            continue;
          }

          if (!this.hasCapability(alarmCapability)) {
            await this.addCapability(alarmCapability).catch(this.error);
          }
          await this.setAlarm(alarmCapability);
        }
      }
    }
  }

  async setAlarm(capability: string): Promise<void> {
    await super.setAlarm(
      capability,
      async () => {
        const deviceTriggerCard = this.homey.flow.getDeviceTriggerCard(`${this.driver.id}_${capability}_true`);
        await deviceTriggerCard.trigger(this).catch(this.error);
        await this.setCapabilityValue(capability, true).catch(this.error);
      },
      async () => {
        const deviceTriggerCard = this.homey.flow.getDeviceTriggerCard(`${this.driver.id}_${capability}_false`);
        await deviceTriggerCard.trigger(this).catch(this.error);
        await this.setCapabilityValue(capability, false).catch(this.error);
      },
    );
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

  async onSettings(event: SettingsEvent<HomeyCameraSettings>): Promise<string | void> {
    const tuyaSettingsEvent = TuyaOAuth2Util.filterTuyaSettings<HomeyCameraSettings, TuyaCameraSettings>(event, [
      'motion_switch',
      'motion_tracking',
      'decibel_switch',
      'cry_detection_switch',
      'pet_detection',
      'motion_sensitivity',
      'decibel_sensitivity',
      'basic_nightvision',
      'basic_device_volume',
      'basic_anti_flicker',
      'basic_osd',
      'basic_flip',
      'basic_indicator',
    ]);
    return await TuyaOAuth2Util.onSettings<TuyaCameraSettings>(this, tuyaSettingsEvent, CAMERA_SETTING_LABELS);
  }
}

export default TuyaOAuth2DeviceWithCamera;
