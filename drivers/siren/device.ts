import TuyaOAuth2Device from '../../lib/TuyaOAuth2Device';
import * as TuyaOAuth2Util from '../../lib/TuyaOAuth2Util';
import { constIncludes, getFromMap } from '../../lib/TuyaOAuth2Util';
import { SettingsEvent, TuyaStatus } from '../../types/TuyaTypes';
import { SIREN_CAPABILITIES, SIREN_CAPABILITIES_MAPPING, SIREN_SETTING_LABELS } from './TuyaSirenConstants';

module.exports = class TuyaOAuth2DeviceCamera extends TuyaOAuth2Device {
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async onSettings(event: SettingsEvent<any>): Promise<string | void> {
    return await TuyaOAuth2Util.onSettings(this, event, SIREN_SETTING_LABELS);
  }
};
