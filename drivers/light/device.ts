import * as TuyaLightMigrations from '../../lib/migrations/TuyaLightMigrations';
import { TUYA_PERCENTAGE_SCALING } from '../../lib/TuyaOAuth2Constants';
import { TuyaCommand } from '../../types/TuyaApiTypes';
import { SettingsEvent, TuyaStatus } from '../../types/TuyaTypes';
import { LIGHT_SETTING_LABELS, LightSettingCommand, LightSettingKey, PIR_CAPABILITIES } from './TuyaLightConstants';
import TuyaOAuth2DeviceWithLight from '../../lib/TuyaOAuth2DeviceWithLight';

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

  // TODO migrate to util sendSettingCommand
  async sendSettingCommand({ code, value }: LightSettingCommand): Promise<void> {
    await this.sendCommand({
      code: code,
      value: value,
    }).catch(err => {
      if (err.tuyaCode === 2008) {
        throw new Error(
          this.homey.__('setting_unsupported', {
            label: LIGHT_SETTING_LABELS[code],
          }),
        );
      } else if (err.tuyaCode === 501) {
        throw new Error(
          this.homey.__('setting_value_unsupported', {
            label: LIGHT_SETTING_LABELS[code],
          }),
        );
      } else {
        throw err;
      }
    });
  }

  // TODO migrate to util onSettings
  // TODO define settings
  async onSettings({
    newSettings,
    changedKeys,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }: SettingsEvent<Record<LightSettingKey, any>>): Promise<string | void> {
    const unsupportedSettings: string[] = [];
    const unsupportedValues: string[] = [];

    // Accumulate rejected settings so the user can be notified gracefully
    const sendSetting = async (command: TuyaCommand): Promise<void> =>
      this.sendCommand(command).catch(err => {
        if (err.tuyaCode === 2008) {
          unsupportedSettings.push(command.code);
        } else if (err.tuyaCode === 501) {
          unsupportedValues.push(command.code);
        } else {
          throw err;
        }
      });

    // Only send the standby commands once for both settings
    let changedStandby = false;

    for (const changedKey of changedKeys) {
      const newValue = newSettings[changedKey];

      if (changedKey === 'standby_on' || changedKey === 'standby_bright') {
        // Only send the standby commands once for both settings
        if (changedStandby) {
          continue;
        } else {
          changedStandby = true;
        }

        const hasStandbyOn = this.store.tuya_capabilities.includes('standby_on');
        const standbyOn = newSettings['standby_on'];
        const standbyBrightness = newSettings['standby_bright'] as number;
        let commands;

        if (!hasStandbyOn) {
          commands = [
            {
              code: 'standby_bright',
              value: standbyOn ? standbyBrightness * TUYA_PERCENTAGE_SCALING : 0,
            },
          ];
        } else {
          commands = [
            {
              code: 'standby_bright',
              value: standbyBrightness * TUYA_PERCENTAGE_SCALING,
            },
            {
              code: 'standby_on',
              value: standbyOn,
            },
          ];
        }

        for (const command of commands) {
          await sendSetting(command);
        }
      } else {
        await sendSetting({
          code: changedKey,
          value: newValue,
        });
      }
    }

    // Report back which capabilities and values are unsupported,
    // since we cannot programmatically remove settings.
    const messages = [];

    if (unsupportedSettings.length > 0) {
      const mappedSettingNames = unsupportedSettings.map(
        settingKey => LIGHT_SETTING_LABELS[settingKey as LightSettingKey],
      );
      messages.push(this.homey.__('settings_unsupported') + ' ' + mappedSettingNames.join(', '));
    }
    if (unsupportedValues.length > 0) {
      const mappedSettingNames = unsupportedValues.map(
        settingKey => LIGHT_SETTING_LABELS[settingKey as LightSettingKey],
      );
      messages.push(this.homey.__('setting_values_unsupported') + ' ' + mappedSettingNames.join(', '));
    }
    if (messages.length > 0) {
      return messages.join('\n');
    }
  }
}

module.exports = TuyaOAuth2DeviceLight;
