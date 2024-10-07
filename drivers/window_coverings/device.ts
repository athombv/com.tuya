import TuyaOAuth2Device from '../../lib/TuyaOAuth2Device';
import { getFromMap } from '../../lib/TuyaOAuth2Util';
import * as TuyaOAuth2Util from '../../lib/TuyaOAuth2Util';
import { SettingsEvent, TuyaStatus } from '../../types/TuyaTypes';
import {
  WINDOW_COVERINGS_CAPABILITY_MAPPING,
  WINDOW_COVERINGS_SETTING_LABELS,
  HomeyWindowCoveringsSettings,
  TuyaWindowCoveringsSettings,
} from './TuyaWindowCoveringsConstants';

module.exports = class TuyaOAuth2DeviceWindowCoverings extends TuyaOAuth2Device {
  async onOAuth2Init(): Promise<void> {
    await super.onOAuth2Init();

    if (this.hasCapability('windowcoverings_state')) {
      if (this.hasTuyaCapability('control')) {
        this.registerCapabilityListener('windowcoverings_state', value => {
          let mappedValue = 'stop';
          if (value === 'up') mappedValue = 'open';
          if (value === 'down') mappedValue = 'close';
          return this.sendCommand({
            code: 'control',
            value: mappedValue,
          });
        });
      } else if (this.hasTuyaCapability('mach_operate')) {
        this.registerCapabilityListener('windowcoverings_state', value => {
          let mappedValue = 'STOP';
          if (value === 'up') mappedValue = 'ZZ';
          if (value === 'down') mappedValue = 'FZ';
          return this.sendCommand({
            code: 'mach_operate',
            value: mappedValue,
          });
        });
      }
    }

    if (this.hasCapability('windowcoverings_set')) {
      const code = this.hasTuyaCapability('percent_control') ? 'percent_control' : 'position';
      this.registerCapabilityListener('windowcoverings_set', value =>
        this.sendCommand({ code: code, value: Math.round(value * 100) }),
      );
    }
  }

  async onTuyaStatus(status: TuyaStatus, changed: string[]): Promise<void> {
    await super.onTuyaStatus(status, changed);

    for (const tuyaCapability in status) {
      const value = status[tuyaCapability];
      const homeyCapability = getFromMap(WINDOW_COVERINGS_CAPABILITY_MAPPING, tuyaCapability);

      if (['control', 'mach_operate'].includes(tuyaCapability) && homeyCapability) {
        let mappedValue;
        if (value === 'open' || value === 'ZZ') {
          mappedValue = 'up';
        } else if (value === 'close' || value === 'FZ') {
          mappedValue = 'down';
        } else {
          mappedValue = 'idle';
        }
        await this.safeSetCapabilityValue(homeyCapability, mappedValue);
      }

      if (tuyaCapability === 'percent_control' && homeyCapability && !this.hasTuyaCapability('percent_state')) {
        await this.safeSetCapabilityValue(homeyCapability, (value as number) / 100);
      }

      if (['position', 'percent_state'].includes(tuyaCapability) && homeyCapability) {
        await this.safeSetCapabilityValue(homeyCapability, (value as number) / 100);
      }

      if (['opposite', 'control_back'].includes(tuyaCapability)) {
        await this.setSettings({ inverse: value }).catch(this.error);
      }

      if (tuyaCapability === 'control_back_mode') {
        await this.setSettings({ inverse: value === 'back' }).catch(this.error);
      }
    }
  }

  async onSettings(event: SettingsEvent<HomeyWindowCoveringsSettings>): Promise<string | void> {
    const tuyaSettings: SettingsEvent<Partial<TuyaWindowCoveringsSettings>> = {
      newSettings: {},
      oldSettings: {},
      changedKeys: [],
    };

    if (event.changedKeys.includes('inverse')) {
      if (this.hasTuyaCapability('control_back')) {
        tuyaSettings.changedKeys.push('control_back');
        tuyaSettings.newSettings['control_back'] = event.newSettings['inverse'];
      } else if (this.hasTuyaCapability('opposite')) {
        tuyaSettings.changedKeys.push('opposite');
        tuyaSettings.newSettings['opposite'] = event.newSettings['inverse'];
      } else {
        tuyaSettings.changedKeys.push('control_back_mode');
        tuyaSettings.newSettings['control_back_mode'] = event.newSettings['inverse'] ? 'back' : 'forward';
      }
    }

    return TuyaOAuth2Util.onSettings(this, tuyaSettings, WINDOW_COVERINGS_SETTING_LABELS);
  }
};
