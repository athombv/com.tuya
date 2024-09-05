import * as TuyaLightMigrations from '../../lib/migrations/TuyaLightMigrations';
import { TUYA_PERCENTAGE_SCALING } from '../../lib/TuyaOAuth2Constants';
import { SettingsEvent, TuyaStatus } from '../../types/TuyaTypes';
import { HomeyLightSettings, LIGHT_SETTING_LABELS, PIR_CAPABILITIES, TuyaLightSettings } from './TuyaLightConstants';
import TuyaOAuth2DeviceWithLight from '../../lib/TuyaOAuth2DeviceWithLight';
import { filterTuyaSettings, reportUnsupportedSettings, sendSettings } from '../../lib/TuyaOAuth2Util';

export default class TuyaOAuth2DeviceLight extends TuyaOAuth2DeviceWithLight {
  async performMigrations(): Promise<void> {
    await super.performMigrations();
    await TuyaLightMigrations.performMigrations(this);
  }

  async onOAuth2Init(): Promise<void> {
    if (this.getStoreValue('tuya_category') === 'dj') {
      // Check if we need to use v2 Tuya capabilities
      if (this.hasTuyaCapability('bright_value_v2')) {
        this.LIGHT_DIM_TUYA_CAPABILITY = 'bright_value_v2';
        this.LIGHT_DIM_TUYA_SPECS = 'tuya_brightness_v2';
      }

      if (this.hasTuyaCapability('temp_value_v2')) {
        this.LIGHT_TEMP_TUYA_CAPABILITY = 'temp_value_v2';
        this.LIGHT_TEMP_TUYA_SPECS = 'tuya_temperature_v2';
      }

      if (this.hasTuyaCapability('colour_data_v2')) {
        this.LIGHT_COLOR_TUYA_CAPABILITY = 'colour_data_v2';
        this.LIGHT_COLOR_TUYA_SPECS = 'tuya_colour_v2';
      }
    }
    // superclass handles all light capabilities, except for onoff
    await super.onOAuth2Init();

    // onoff
    if (this.hasCapability('onoff')) {
      this.registerCapabilityListener('onoff', value => this.allOnOff(value));
    }

    const tuyaSwitches = this.getStore().tuya_switches;

    for (const tuyaSwitch of tuyaSwitches) {
      if (this.hasCapability(`onoff.${tuyaSwitch}`)) {
        this.registerCapabilityListener(`onoff.${tuyaSwitch}`, value => this.switchOnOff(value, tuyaSwitch));
      }
    }
  }

  async onTuyaStatus(status: TuyaStatus, changedStatusCodes: string[]): Promise<void> {
    // superclass handles all light capabilities, except for onoff
    await super.onTuyaStatus(status, changedStatusCodes);

    // onoff
    let anySwitchOn = false;

    const tuyaSwitches = this.getStore().tuya_switches;

    for (const tuyaSwitch of tuyaSwitches) {
      const switchStatus = status[tuyaSwitch];
      const switchCapability = `onoff.${tuyaSwitch}`;

      if (typeof switchStatus === 'boolean') {
        anySwitchOn = anySwitchOn || switchStatus;

        if (changedStatusCodes.includes(tuyaSwitch)) {
          const triggerCardId = `light_${tuyaSwitch}_turned_${switchStatus ? 'on' : 'off'}`;
          const triggerCard = this.homey.flow.getDeviceTriggerCard(triggerCardId);

          triggerCard.trigger(this).catch(this.error);
        }

        if (this.hasCapability(switchCapability)) {
          this.setCapabilityValue(switchCapability, switchStatus).catch(this.error);
        }
      }
    }

    if (this.hasCapability('onoff')) {
      this.setCapabilityValue('onoff', anySwitchOn).catch(this.error);
    }

    // PIR
    for (const pirCapability of PIR_CAPABILITIES.setting) {
      const newValue = status[pirCapability];
      if (newValue !== undefined) {
        await this.setSettings({
          [pirCapability]: newValue,
        }).catch(this.error);
      }
    }

    if (status['pir_state'] !== undefined && this.hasCapability('alarm_motion')) {
      const pirTurnedOn = status['switch_pir'] || !this.store.tuya_capabilities.includes('switch_pir');
      const newPirState = status['pir_state'] === 'pir' && pirTurnedOn;
      this.setCapabilityValue('alarm_motion', newPirState).catch(this.error);
    }

    if (status['standby_on'] !== undefined || status['standby_bright'] !== undefined) {
      const hasStandbyOn = this.store.tuya_capabilities.includes('standby_on');
      const standbyOn = status['standby_on'] as boolean;
      const standbyBrightness = status['standby_bright'] as number;
      let settings;

      if (!hasStandbyOn) {
        if (standbyBrightness > 0) {
          settings = {
            standby_on: true,
            standby_bright: standbyBrightness / TUYA_PERCENTAGE_SCALING,
          };
        } else {
          // Keep the brightness setting for when turning standby back on
          settings = {
            standby_on: false,
          };
        }
      } else {
        settings = {
          standby_on: standbyOn,
          standby_bright: standbyBrightness / TUYA_PERCENTAGE_SCALING,
        };
      }
      await this.setSettings(settings).catch(this.error);
    }
  }

  async allOnOff(value: boolean): Promise<void> {
    const tuyaSwitches = this.getStore().tuya_switches;
    const commands = [];

    for (const tuyaSwitch of tuyaSwitches) {
      commands.push({
        code: tuyaSwitch,
        value: value,
      });
    }

    await this.sendCommands(commands);
  }

  async switchOnOff(value: boolean, tuya_switch: string): Promise<void> {
    await this.sendCommand({
      code: tuya_switch,
      value: value,
    });
  }

  async onSettings(event: SettingsEvent<HomeyLightSettings>): Promise<string | void> {
    const nonStandbySettings = filterTuyaSettings<HomeyLightSettings, TuyaLightSettings>(event, [
      'switch_pir',
      'pir_sensitivity',
      'pir_delay',
      'cds',
      'standby_time',
    ]);

    const [unsupportedSettings, unsupportedValues] = await sendSettings(this, nonStandbySettings);

    if (event.changedKeys.includes('standby_on') || event.changedKeys.includes('standby_bright')) {
      const standbyOn = event.newSettings['standby_on'];
      const standbyBrightness = event.newSettings['standby_bright'] as number;

      if (!this.hasTuyaCapability('standby_on')) {
        await this.sendCommand({
          code: 'standby_bright',
          value: standbyOn ? standbyBrightness * TUYA_PERCENTAGE_SCALING : 0,
        }).catch(err => {
          if (err.tuyaCode === 2008) {
            unsupportedSettings.push('standby_bright');
          } else if (err.tuyaCode === 501) {
            unsupportedValues.push('standby_bright');
          } else {
            throw err;
          }
        });
      } else {
        await this.sendCommands([
          {
            code: 'standby_bright',
            value: standbyBrightness * TUYA_PERCENTAGE_SCALING,
          },
          {
            code: 'standby_on',
            value: standbyOn,
          },
        ]).catch(err => {
          if (err.tuyaCode === 2008) {
            unsupportedSettings.push('standby_bright', 'standby_on');
          } else if (err.tuyaCode === 501) {
            unsupportedValues.push('standby_bright', 'standby_on');
          } else {
            throw err;
          }
        });
      }
    }

    return reportUnsupportedSettings(this, unsupportedSettings, unsupportedValues, LIGHT_SETTING_LABELS);
  }
}

module.exports = TuyaOAuth2DeviceLight;
