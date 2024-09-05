import { SettingsEvent, TuyaStatus } from '../../types/TuyaTypes';
import {
  FAN_CAPABILITIES,
  FAN_CAPABILITIES_MAPPING,
  FAN_LIGHT_CAPABILITIES_MAPPING,
  FAN_SETTING_LABELS,
  HomeyFanSettings,
  TuyaFanSettings,
} from './TuyaFanConstants';
import * as TuyaOAuth2Util from '../../lib/TuyaOAuth2Util';
import { constIncludes, getFromMap } from '../../lib/TuyaOAuth2Util';
import * as TuyaFanMigrations from '../../lib/migrations/TuyaFanMigrations';
import TuyaOAuth2DeviceWithLight from '../../lib/TuyaOAuth2DeviceWithLight';

export default class TuyaOAuth2DeviceFan extends TuyaOAuth2DeviceWithLight {
  LIGHT_DIM_CAPABILITY = 'dim.light';

  async onOAuth2Init(): Promise<void> {
    // superclass handles light capabilities, except onoff.light
    await super.onOAuth2Init();

    for (const [tuyaCapability, capability] of Object.entries(FAN_CAPABILITIES_MAPPING)) {
      if (
        constIncludes(FAN_CAPABILITIES.read_write, tuyaCapability) &&
        this.hasCapability(capability) &&
        this.hasTuyaCapability(tuyaCapability)
      ) {
        this.registerCapabilityListener(capability, value => this.sendCommand({ code: tuyaCapability, value }));
      }
    }

    // fan_speed
    if (this.hasCapability('legacy_fan_speed')) {
      this.registerCapabilityListener('legacy_fan_speed', value => this.sendCommand({ code: 'fan_speed', value }));
    }

    if (this.hasCapability('dim') && this.getStoreValue('tuya_category') === 'fsd') {
      this.registerCapabilityListener('dim', value => this.sendCommand({ code: 'fan_speed', value }));
    }
  }

  async performMigrations(): Promise<void> {
    await super.performMigrations();
    await TuyaFanMigrations.performMigrations(this);
  }

  async onTuyaStatus(status: TuyaStatus, changedStatusCodes: string[]): Promise<void> {
    // superclass handles light capabilities, except onoff.light
    await super.onTuyaStatus(status, changedStatusCodes);

    for (const tuyaCapability in status) {
      const value = status[tuyaCapability];
      const homeyCapability = getFromMap(FAN_CAPABILITIES_MAPPING, tuyaCapability);

      if (
        (constIncludes(FAN_CAPABILITIES.read_write, tuyaCapability) ||
          constIncludes(FAN_CAPABILITIES.read_only, tuyaCapability)) &&
        homeyCapability
      ) {
        await this.safeSetCapabilityValue(homeyCapability, value);
      }

      if (constIncludes(FAN_CAPABILITIES.setting, tuyaCapability)) {
        await this.setSettings({
          [tuyaCapability]: value,
        });
      }

      if (tuyaCapability === 'fan_speed') {
        if (this.getStoreValue('tuya_category') === 'fsd') {
          await this.safeSetCapabilityValue('dim', value);
        } else {
          await this.safeSetCapabilityValue('legacy_fan_speed', value);
        }
      }
    }

    // flows
    if (this.getSetting('enable_light_support')) {
      if (changedStatusCodes.includes('bright_value')) {
        await this.homey.flow
          .getDeviceTriggerCard('fan_light_dim_changed')
          .trigger(this, { value: status['bright_value'] })
          .catch(this.error);
      }

      if (changedStatusCodes.includes('light')) {
        await this.homey.flow
          .getDeviceTriggerCard(`fan_light_onoff_${status['light']}`)
          .trigger(this)
          .catch(this.error);
      }

      if (changedStatusCodes.includes('switch_led')) {
        await this.homey.flow
          .getDeviceTriggerCard(`fan_light_onoff_${status['switch_led']}`)
          .trigger(this)
          .catch(this.error);
      }
    }
  }

  async onSettings(event: SettingsEvent<HomeyFanSettings>): Promise<string | void> {
    if (event.changedKeys.includes('enable_light_support')) {
      if (event.newSettings['enable_light_support']) {
        for (const [tuyaCapability, homeyCapability] of Object.entries(FAN_LIGHT_CAPABILITIES_MAPPING)) {
          if (this.hasTuyaCapability(tuyaCapability) && !this.hasCapability(homeyCapability)) {
            await this.addCapability(homeyCapability);
          }
        }
        if (this.hasTuyaCapability('colour')) {
          if (!this.hasCapability('light_hue')) await this.addCapability('light_hue');
          if (!this.hasCapability('light_saturation')) await this.addCapability('light_saturation');
          if (!this.hasCapability('dim.light')) await this.addCapability('dim.light');
        }
        if (this.hasCapability('light_temperature') && this.hasCapability('light_hue')) {
          if (!this.hasCapability('light_mode')) await this.addCapability('light_mode');
        }
      } else {
        for (const lightCapability of [
          'onoff.light',
          'dim.light',
          'light_mode',
          'light_temperature',
          'light_hue',
          'light_saturation',
        ]) {
          if (this.hasCapability(lightCapability)) await this.removeCapability(lightCapability);
        }
      }
    }

    const tuyaSettingsEvent = TuyaOAuth2Util.filterTuyaSettings<HomeyFanSettings, TuyaFanSettings>(event, [
      'fan_direction',
    ]);

    return TuyaOAuth2Util.onSettings<TuyaFanSettings>(this, tuyaSettingsEvent, FAN_SETTING_LABELS);
  }
}

module.exports = TuyaOAuth2DeviceFan;
