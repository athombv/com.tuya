import TuyaOAuth2Device from '../../lib/TuyaOAuth2Device';
import * as TuyaOAuth2Util from '../../lib/TuyaOAuth2Util';
import { constIncludes, getFromMap } from '../../lib/TuyaOAuth2Util';
import { SettingsEvent, TuyaStatus } from '../../types/TuyaTypes';
import {
  HomeSirenSettings,
  SIREN_CAPABILITIES,
  SIREN_CAPABILITIES_MAPPING,
  SIREN_SETTING_LABELS,
  TuyaSirenSettings,
} from './TuyaSirenConstants';

module.exports = class TuyaOAuth2DeviceSiren extends TuyaOAuth2Device {
  async onOAuth2Init(): Promise<void> {
    await super.onOAuth2Init();

    for (const [tuyaCapability, capability] of Object.entries(SIREN_CAPABILITIES_MAPPING)) {
      if (this.hasCapability(capability)) {
        this.registerCapabilityListener(capability, value => this.sendCommand({ code: tuyaCapability, value }));
      }
    }
  }

  async onTuyaStatus(status: TuyaStatus, changed: string[]): Promise<void> {
    await super.onTuyaStatus(status, changed);

    for (const statusKey in status) {
      const value = status[statusKey];

      const capability = getFromMap(SIREN_CAPABILITIES_MAPPING, statusKey);
      if (capability) {
        await this.setCapabilityValue(capability, value).catch(this.error);
      }

      if (statusKey === 'battery_state') {
        await this.setCapabilityValue('alarm_battery', status['battery_state'] === 'low').catch(this.error);
      }

      if (constIncludes(SIREN_CAPABILITIES.setting, statusKey)) {
        await this.setSettings({
          [statusKey]: value,
        }).catch(this.error);
      }
    }
  }

  async onSettings(event: SettingsEvent<HomeSirenSettings>): Promise<string | void> {
    return await TuyaOAuth2Util.onSettings<TuyaSirenSettings>(this, event, SIREN_SETTING_LABELS);
  }
};
