/* eslint-disable camelcase */

'use strict';

const TuyaOAuth2Device = require('./TuyaOAuth2Device');
const {PIR_CAPABILITIES, LIGHT_SETTING_LABELS} = require('./TuyaLightConstants');
const {TUYA_PERCENTAGE_SCALING} = require('./TuyaOAuth2Constants');
const TuyaLightMigrations = require('./migrations/TuyaLightMigrations')

/**
 * Device Class for Tuya Lights
 * @extends TuyaOAuth2Device
 * @hideconstructor
 */
class TuyaOAuth2DeviceLight extends TuyaOAuth2Device {

  LIGHT_COLOUR_DATA_V1_HUE_MIN = this.store.tuya_colour?.h?.min;
  LIGHT_COLOUR_DATA_V1_HUE_MAX = this.store.tuya_colour?.h?.max;
  LIGHT_COLOUR_DATA_V1_SATURATION_MIN = this.store.tuya_colour?.s?.min;
  LIGHT_COLOUR_DATA_V1_SATURATION_MAX = this.store.tuya_colour?.s?.max;
  LIGHT_COLOUR_DATA_V1_VALUE_MIN = this.store.tuya_colour?.v?.min;
  LIGHT_COLOUR_DATA_V1_VALUE_MAX = this.store.tuya_colour?.v?.max;

  LIGHT_COLOUR_DATA_V2_HUE_MIN = this.store.tuya_colour_v2?.h?.min;
  LIGHT_COLOUR_DATA_V2_HUE_MAX = this.store.tuya_colour_v2?.h?.max;
  LIGHT_COLOUR_DATA_V2_SATURATION_MIN = this.store.tuya_colour_v2?.s?.min;
  LIGHT_COLOUR_DATA_V2_SATURATION_MAX = this.store.tuya_colour_v2?.s?.max;
  LIGHT_COLOUR_DATA_V2_VALUE_MIN = this.store.tuya_colour_v2?.v?.min;
  LIGHT_COLOUR_DATA_V2_VALUE_MAX = this.store.tuya_colour_v2?.v?.max;

  LIGHT_TEMP_VALUE_V1_MIN = this.store.tuya_temperature?.min;
  LIGHT_TEMP_VALUE_V1_MAX = this.store.tuya_temperature?.max;
  LIGHT_TEMP_VALUE_V2_MIN = this.store.tuya_temperature_v2?.min;
  LIGHT_TEMP_VALUE_V2_MAX = this.store.tuya_temperature_v2?.max;

  LIGHT_BRIGHT_VALUE_V1_MIN = this.store.tuya_brightness?.min;
  LIGHT_BRIGHT_VALUE_V1_MAX = this.store.tuya_brightness?.max;

  LIGHT_BRIGHT_VALUE_V2_MIN = this.store.tuya_brightness_v2?.min;
  LIGHT_BRIGHT_VALUE_V2_MAX = this.store.tuya_brightness_v2?.max;

  // Ensure migrations are finished before the device is used
  initBarrier = true;

  async onOAuth2Init() {
    await super.onOAuth2Init();

    await TuyaLightMigrations.performMigrations(this);

    // onoff
    if (this.hasCapability('onoff')) {
      this.registerCapabilityListener('onoff', (value) => this.allOnOff(value));
    }

    const tuyaSwitches = this.getStore().tuya_switches;

    for (const tuyaSwitch of tuyaSwitches) {
      if (this.hasCapability(`onoff.${tuyaSwitch}`)) {
        this.registerCapabilityListener(`onoff.${tuyaSwitch}`, (value) => this.switchOnOff(value, tuyaSwitch))
      }
    }

    // light capabilities
    const lightCapabilities = [];
    if (this.hasCapability('dim')) lightCapabilities.push('dim');
    if (this.hasCapability('light_hue')) lightCapabilities.push('light_hue');
    if (this.hasCapability('light_saturation')) lightCapabilities.push('light_saturation');
    if (this.hasCapability('light_temperature')) lightCapabilities.push('light_temperature');
    if (this.hasCapability('light_mode')) lightCapabilities.push('light_mode');

    if (lightCapabilities.length > 0) {
      this.registerMultipleCapabilityListener(lightCapabilities, capabilityValues => this.onCapabilitiesLight(capabilityValues), 150);
    }

    this.initBarrier = false;
    this.log('Finished oAuth2 initialization of', this.getName());
  }

  async onTuyaStatus(status, changedStatusCodes) {
    while (this.initBarrier) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    await super.onTuyaStatus(status);

    // onoff
    let anySwitchOn = false;

    const tuyaSwitches = this.getStore().tuya_switches;

    for (const tuyaSwitch of tuyaSwitches) {
      const switchStatus = status[tuyaSwitch];
      const switchCapability = `onoff.${tuyaSwitch}`;

      if (typeof switchStatus === 'boolean') {
        anySwitchOn = anySwitchOn || switchStatus;

        if (changedStatusCodes.includes(tuyaSwitch)) {
          const triggerCardId = `light_${tuyaSwitch}_turned_${switchStatus ? 'on' : 'off'}`
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

    // light_temperature
    if (typeof status['temp_value'] === 'number') {
      const light_temperature = Math.min(1, Math.max(0, 1 - (status['temp_value'] - this.LIGHT_TEMP_VALUE_V1_MIN) / (this.LIGHT_TEMP_VALUE_V1_MAX - this.LIGHT_TEMP_VALUE_V1_MIN)));
      this.setCapabilityValue('light_temperature', light_temperature).catch(this.error);
    }

    if (typeof status['temp_value_v2'] === 'number') {
      const light_temperature = Math.min(1, Math.max(0, 1 - (status['temp_value_v2'] - this.LIGHT_TEMP_VALUE_V2_MIN) / (this.LIGHT_TEMP_VALUE_V2_MAX - this.LIGHT_TEMP_VALUE_V2_MIN)));
      this.setCapabilityValue('light_temperature', light_temperature).catch(this.error);
    }

    // light_hue, light_saturation
    if (status['colour_data']) {
      const light_hue = Math.min(1, Math.max(0, (status['colour_data']['h'] - this.LIGHT_COLOUR_DATA_V1_HUE_MIN) / (this.LIGHT_COLOUR_DATA_V1_HUE_MAX - this.LIGHT_COLOUR_DATA_V1_HUE_MIN)));
      this.setCapabilityValue('light_hue', light_hue).catch(this.error);

      const light_saturation = Math.min(1, Math.max(0, (status['colour_data']['s'] - this.LIGHT_COLOUR_DATA_V1_SATURATION_MIN) / (this.LIGHT_COLOUR_DATA_V1_SATURATION_MAX - this.LIGHT_COLOUR_DATA_V1_SATURATION_MIN)));
      this.setCapabilityValue('light_saturation', light_saturation).catch(this.error);
    }

    if (status['colour_data_v2']) {
      const light_hue = Math.min(1, Math.max(0, (status['colour_data_v2']['h'] - this.LIGHT_COLOUR_DATA_V2_HUE_MIN) / (this.LIGHT_COLOUR_DATA_V2_HUE_MAX - this.LIGHT_COLOUR_DATA_V2_HUE_MIN)));
      this.setCapabilityValue('light_hue', light_hue).catch(this.error);

      const light_saturation = Math.min(1, Math.max(0, (status['colour_data_v2']['s'] - this.LIGHT_COLOUR_DATA_V2_SATURATION_MIN) / (this.LIGHT_COLOUR_DATA_V2_SATURATION_MAX - this.LIGHT_COLOUR_DATA_V2_SATURATION_MIN)));
      this.setCapabilityValue('light_saturation', light_saturation).catch(this.error);
    }

    // light_mode
    if (status['work_mode']) {
      if (status['work_mode'] === 'colour') {
        if (this.hasCapability('light_mode')) {
          this.setCapabilityValue('light_mode', 'color').catch(this.error);
        }

        // dim
        if (status['colour_data']) {
          const dim = Math.min(1, Math.max(0, (status['colour_data']['v'] - this.LIGHT_COLOUR_DATA_V1_VALUE_MIN) / (this.LIGHT_COLOUR_DATA_V1_VALUE_MAX - this.LIGHT_COLOUR_DATA_V1_VALUE_MIN)));
          this.setCapabilityValue('dim', dim).catch(this.error);
        }

        if (status['colour_data_v2']) {
          const dim = Math.min(1, Math.max(0, (status['colour_data_v2']['v'] - this.LIGHT_COLOUR_DATA_V2_VALUE_MIN) / (this.LIGHT_COLOUR_DATA_V2_VALUE_MAX - this.LIGHT_COLOUR_DATA_V2_VALUE_MIN)));
          this.setCapabilityValue('dim', dim).catch(this.error);
        }
      }

      if (status['work_mode'] === 'white') {
        if (this.hasCapability('light_mode')) {
          this.setCapabilityValue('light_mode', 'temperature').catch(this.error);
        }

        // dim
        if (typeof status['bright_value'] === 'number') {
          const dim = Math.min(1, Math.max(0, (status['bright_value'] - this.LIGHT_BRIGHT_VALUE_V1_MIN) / (this.LIGHT_BRIGHT_VALUE_V1_MAX - this.LIGHT_BRIGHT_VALUE_V1_MIN)));
          this.setCapabilityValue('dim', dim).catch(this.error);
        }

        if (typeof status['bright_value_v2'] === 'number') {
          const dim = Math.min(1, Math.max(0, (status['bright_value_v2'] - this.LIGHT_BRIGHT_VALUE_V2_MIN) / (this.LIGHT_BRIGHT_VALUE_V2_MAX - this.LIGHT_BRIGHT_VALUE_V2_MIN)));
          this.setCapabilityValue('dim', dim).catch(this.error);
        }
      }
    } else {
      // dim
      if (typeof status['bright_value'] === 'number') {
        const dim = Math.min(1, Math.max(0, (status['bright_value'] - this.LIGHT_BRIGHT_VALUE_V1_MIN) / (this.LIGHT_BRIGHT_VALUE_V1_MAX - this.LIGHT_BRIGHT_VALUE_V1_MIN)));
        this.setCapabilityValue('dim', dim).catch(this.error);
      }

      if (typeof status['bright_value_v2'] === 'number') {
        const dim = Math.min(1, Math.max(0, (status['bright_value_v2'] - this.LIGHT_BRIGHT_VALUE_V2_MIN) / (this.LIGHT_BRIGHT_VALUE_V2_MAX - this.LIGHT_BRIGHT_VALUE_V2_MIN)));
        this.setCapabilityValue('dim', dim).catch(this.error);
      }
    }

    // PIR
    for (const pirCapability of PIR_CAPABILITIES.setting) {
      const newValue = status[pirCapability];
      if (newValue !== undefined) {
        await this.setSettings({
          [pirCapability]: newValue,
        }).catch(this.error)
      }
    }

    if (status['pir_state'] !== undefined && this.hasCapability('alarm_motion')) {
      const pirTurnedOn = status['switch_pir'] || !this.store.tuya_capabilities.includes('switch_pir');
      const newPirState = status['pir_state'] === 'pir' && pirTurnedOn;
      this.setCapabilityValue('alarm_motion', newPirState).catch(this.error)
    }

    if (status['standby_on'] !== undefined || status['standby_bright'] !== undefined) {
      const hasStandbyOn = this.store.tuya_capabilities.includes('standby_on');
      const standbyOn = status['standby_on'];
      const standbyBrightness = status['standby_bright'];
      let settings = {};

      if (!hasStandbyOn) {
        if (standbyBrightness > 0) {
          settings = {
            'standby_on': true,
            'standby_bright': standbyBrightness / TUYA_PERCENTAGE_SCALING,
          }
        } else {
          // Keep the brightness setting for when turning standby back on
          settings = {
            'standby_on': false,
          }
        }
      } else {
        settings = {
          'standby_on': standbyOn,
          'standby_bright': standbyBrightness / TUYA_PERCENTAGE_SCALING,
        }
      }
      await this.setSettings(settings).catch(this.error)
    }
  }

  async allOnOff(value) {
    const tuyaSwitches = this.getStore().tuya_switches;
    const commands = []

    for (const tuyaSwitch of tuyaSwitches) {
      commands.push({
        code: tuyaSwitch,
        value: !!value,
      })
    }

    await this.sendCommands(commands);
  }

  async switchOnOff(value, tuya_switch) {
    await this.sendCommand({
      code: tuya_switch,
      value: !!value,
    });
  }

  async onCapabilitiesLight({
    dim = this.getCapabilityValue('dim'),
    light_mode = this.getCapabilityValue('light_mode'),
    light_hue = this.getCapabilityValue('light_hue'),
    light_saturation = this.getCapabilityValue('light_saturation'),
    light_temperature = this.getCapabilityValue('light_temperature'),
  }) {
    const commands = [];

    // Light mode is not available when a light only has temperature or color
    if (!this.hasCapability('light_mode')) {
      if (this.hasCapability('light_hue')) {
        light_mode = 'color';
      } else if (this.hasCapability('light_temperature')) {
        light_mode = 'temperature';
      }
    }

    if (light_mode === 'color') {
      if (this.hasTuyaCapability('colour_data')) {
        commands.push({
          code: 'colour_data',
          value: {
            h: Math.min(this.LIGHT_COLOUR_DATA_V1_HUE_MAX, Math.max(this.LIGHT_COLOUR_DATA_V1_HUE_MIN, Math.round(this.LIGHT_COLOUR_DATA_V1_HUE_MIN + light_hue * (this.LIGHT_COLOUR_DATA_V1_HUE_MAX - this.LIGHT_COLOUR_DATA_V1_HUE_MIN)))),
            s: Math.min(this.LIGHT_COLOUR_DATA_V1_SATURATION_MAX, Math.max(this.LIGHT_COLOUR_DATA_V1_SATURATION_MIN, Math.round(this.LIGHT_COLOUR_DATA_V1_SATURATION_MIN + light_saturation * (this.LIGHT_COLOUR_DATA_V1_SATURATION_MAX - this.LIGHT_COLOUR_DATA_V1_SATURATION_MIN)))),
            // Prevent a value of 0, which causes unwanted behavior
            v: Math.min(this.LIGHT_COLOUR_DATA_V1_VALUE_MAX, Math.max(1, this.LIGHT_COLOUR_DATA_V1_VALUE_MIN, Math.round(this.LIGHT_COLOUR_DATA_V1_VALUE_MIN + dim * (this.LIGHT_COLOUR_DATA_V1_VALUE_MAX - this.LIGHT_COLOUR_DATA_V1_VALUE_MIN)))),
          },
        });
      }

      if (this.hasTuyaCapability('colour_data_v2')) {
        commands.push({
          code: 'colour_data_v2',
          value: {
            h: Math.min(this.LIGHT_COLOUR_DATA_V2_HUE_MAX, Math.max(this.LIGHT_COLOUR_DATA_V2_HUE_MIN, Math.round(this.LIGHT_COLOUR_DATA_V2_HUE_MIN + light_hue * (this.LIGHT_COLOUR_DATA_V2_HUE_MAX - this.LIGHT_COLOUR_DATA_V2_HUE_MIN)))),
            s: Math.min(this.LIGHT_COLOUR_DATA_V2_SATURATION_MAX, Math.max(this.LIGHT_COLOUR_DATA_V2_SATURATION_MIN, Math.round(this.LIGHT_COLOUR_DATA_V2_SATURATION_MIN + light_saturation * (this.LIGHT_COLOUR_DATA_V2_SATURATION_MAX - this.LIGHT_COLOUR_DATA_V2_SATURATION_MIN)))),
            // Prevent a value of 0, which causes unwanted behavior
            v: Math.min(this.LIGHT_COLOUR_DATA_V2_VALUE_MAX, Math.max(1, this.LIGHT_COLOUR_DATA_V2_VALUE_MIN, Math.round( this.LIGHT_COLOUR_DATA_V2_VALUE_MIN + dim * (this.LIGHT_COLOUR_DATA_V2_VALUE_MAX - this.LIGHT_COLOUR_DATA_V2_VALUE_MIN)))),
          },
        });
      }
    } else if (light_mode === 'temperature') {
      if (this.hasTuyaCapability('bright_value')) {
        commands.push({
          code: 'bright_value',
          value: Math.min(this.LIGHT_BRIGHT_VALUE_V1_MAX, Math.max(this.LIGHT_BRIGHT_VALUE_V1_MIN, Math.round(this.LIGHT_BRIGHT_VALUE_V1_MIN + dim * (this.LIGHT_BRIGHT_VALUE_V1_MAX - this.LIGHT_BRIGHT_VALUE_V1_MIN)))),
        });
      }

      if (this.hasTuyaCapability('bright_value_v2')) {
        commands.push({
          code: 'bright_value_v2',
          value: Math.min(this.LIGHT_BRIGHT_VALUE_V2_MAX, Math.max(this.LIGHT_BRIGHT_VALUE_V2_MIN, Math.round(this.LIGHT_BRIGHT_VALUE_V2_MIN + dim * (this.LIGHT_BRIGHT_VALUE_V2_MAX - this.LIGHT_BRIGHT_VALUE_V2_MIN)))),
        });
      }

      if (this.hasTuyaCapability('temp_value')) {
        commands.push({
          code: 'temp_value',
          value: Math.min(this.LIGHT_TEMP_VALUE_V1_MAX, Math.max(this.LIGHT_TEMP_VALUE_V1_MIN, Math.round(this.LIGHT_TEMP_VALUE_V1_MIN + (1 - light_temperature) * (this.LIGHT_TEMP_VALUE_V1_MAX - this.LIGHT_TEMP_VALUE_V1_MIN)))),
        });
      }

      if (this.hasTuyaCapability('temp_value_v2')) {
        commands.push({
          code: 'temp_value_v2',
          value: Math.min(this.LIGHT_TEMP_VALUE_V2_MAX, Math.max(this.LIGHT_TEMP_VALUE_V2_MIN, Math.round(this.LIGHT_TEMP_VALUE_V2_MIN + (1 - light_temperature) * (this.LIGHT_TEMP_VALUE_V2_MAX - this.LIGHT_TEMP_VALUE_V2_MIN)))),
        });
      }
    } else if (this.hasCapability('dim')) {
      if (this.hasTuyaCapability('bright_value')) {
        commands.push({
          code: 'bright_value',
          value: Math.min(this.LIGHT_BRIGHT_VALUE_V1_MAX, Math.max(this.LIGHT_BRIGHT_VALUE_V1_MIN, Math.round(this.LIGHT_BRIGHT_VALUE_V1_MIN + dim * (this.LIGHT_BRIGHT_VALUE_V1_MAX - this.LIGHT_BRIGHT_VALUE_V1_MIN)))),
        });
      }

      if (this.hasTuyaCapability('bright_value_v2')) {
        commands.push({
          code: 'bright_value_v2',
          value: Math.min(this.LIGHT_BRIGHT_VALUE_V2_MAX, Math.max(this.LIGHT_BRIGHT_VALUE_V2_MIN, Math.round(this.LIGHT_BRIGHT_VALUE_V2_MIN + dim * (this.LIGHT_BRIGHT_VALUE_V2_MAX - this.LIGHT_BRIGHT_VALUE_V2_MIN)))),
        });
      }
    }

    if (commands.length) {
      await this.sendCommands(commands);
    }
  }

  async sendSettingCommand({code, value}) {
    await this
      .sendCommand({
        code: code,
        value: value,
      })
      .catch((err) => {
        if (err.tuyaCode === 2008) {
          throw new Error(
            this.homey.__("setting_unsupported", {
              label: LIGHT_SETTING_LABELS[code],
            }),
          );
        } else if (err.tuyaCode === 501) {
          throw new Error(
            this.homey.__("setting_value_unsupported", {
              label: LIGHT_SETTING_LABELS[code],
            }),
          );
        } else {
          throw err;
        }
      });
  }

  async onSettings({ oldSettings, newSettings, changedKeys }) {
    const unsupportedSettings = [];
    const unsupportedValues = [];

    // Accumulate rejected settings so the user can be notified gracefully
    const sendSetting = async (command) =>
      this.sendCommand(command).catch((err) => {
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
        const standbyBrightness = newSettings['standby_bright'];
        let commands;

        if (!hasStandbyOn) {
          commands = [{
            code: 'standby_bright',
            value: standbyOn ? standbyBrightness * TUYA_PERCENTAGE_SCALING : 0,
          }]
        } else {
          commands = [{
            code: 'standby_bright',
            value: standbyBrightness * TUYA_PERCENTAGE_SCALING,
          }, {
            code: 'standby_on',
            value: standbyOn,
          }]
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
        (settingKey) => LIGHT_SETTING_LABELS[settingKey],
      );
      messages.push(this.homey.__("settings_unsupported") + " " + mappedSettingNames.join(", "));
    }
    if (unsupportedValues.length > 0) {
      const mappedSettingNames = unsupportedValues.map(
        (settingKey) => LIGHT_SETTING_LABELS[settingKey],
      );
      messages.push(this.homey.__("setting_values_unsupported") + " " + mappedSettingNames.join(", "));
    }
    if (messages.length > 0) {
      return messages.join("\n");
    }
  }
}

module.exports = TuyaOAuth2DeviceLight;
