/* eslint-disable camelcase */

'use strict';

const TuyaOAuth2Device = require('./TuyaOAuth2Device');

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

  async onOAuth2Init() {
    await super.onOAuth2Init();

    // onoff
    if (this.hasCapability('onoff')) {
      this.registerCapabilityListener('onoff', value => this.onCapabilityOnOff(value));
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
  }

  async onTuyaStatus(status) {
    await super.onTuyaStatus(status);

    // onoff
    if (typeof status['switch_led'] === 'boolean') {
      this.setCapabilityValue('onoff', status['switch_led']).catch(this.error);
    }

    // light_temperature
    if (typeof status['temp_value'] === 'number') {
      const light_temperature = Math.min(1, Math.max(0, (status['temp_value'] - this.LIGHT_TEMP_VALUE_V1_MIN) / (this.LIGHT_TEMP_VALUE_V1_MAX - this.LIGHT_TEMP_VALUE_V1_MIN)));
      this.setCapabilityValue('light_temperature', light_temperature).catch(this.error);
    }

    if (typeof status['temp_value_v2'] === 'number') {
      const light_temperature = Math.min(1, Math.max(0, (status['temp_value_v2'] - this.LIGHT_TEMP_VALUE_V2_MIN) / (this.LIGHT_TEMP_VALUE_V2_MAX - this.LIGHT_TEMP_VALUE_V2_MIN)));
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
        this.setCapabilityValue('light_mode', 'color').catch(this.error);

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
        this.setCapabilityValue('light_mode', 'temperature').catch(this.error);

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
  }

  async onCapabilityOnOff(value) {
    await this.sendCommand({
      code: 'switch_led',
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

    if (this.hasCapability('light_mode') && light_mode === 'color') {
      if (this.hasTuyaCapability('colour_data')) {
        commands.push({
          code: 'colour_data',
          value: {
            h: Math.min(this.LIGHT_COLOUR_DATA_V1_HUE_MAX, Math.max(this.LIGHT_COLOUR_DATA_V1_HUE_MIN, Math.round(light_hue * (this.LIGHT_COLOUR_DATA_V1_HUE_MAX - this.LIGHT_COLOUR_DATA_V1_HUE_MIN)))),
            s: Math.min(this.LIGHT_COLOUR_DATA_V1_SATURATION_MAX, Math.max(this.LIGHT_COLOUR_DATA_V1_SATURATION_MIN, Math.round(light_saturation * (this.LIGHT_COLOUR_DATA_V1_SATURATION_MAX - this.LIGHT_COLOUR_DATA_V1_SATURATION_MIN)))),
            v: Math.min(this.LIGHT_COLOUR_DATA_V1_VALUE_MAX, Math.max(this.LIGHT_COLOUR_DATA_V1_VALUE_MIN, Math.round(dim * (this.LIGHT_COLOUR_DATA_V1_VALUE_MAX - this.LIGHT_COLOUR_DATA_V1_VALUE_MIN)))),
          },
        });
      }

      if (this.hasTuyaCapability('colour_data_v2')) {
        commands.push({
          code: 'colour_data_v2',
          value: {
            h: Math.min(this.LIGHT_COLOUR_DATA_V2_HUE_MAX, Math.max(this.LIGHT_COLOUR_DATA_V2_HUE_MIN, Math.round(light_hue * (this.LIGHT_COLOUR_DATA_V2_HUE_MAX - this.LIGHT_COLOUR_DATA_V2_HUE_MIN)))),
            s: Math.min(this.LIGHT_COLOUR_DATA_V2_SATURATION_MAX, Math.max(this.LIGHT_COLOUR_DATA_V2_SATURATION_MIN, Math.round(light_saturation * (this.LIGHT_COLOUR_DATA_V2_SATURATION_MAX - this.LIGHT_COLOUR_DATA_V2_SATURATION_MIN)))),
            v: Math.min(this.LIGHT_COLOUR_DATA_V2_VALUE_MAX, Math.max(this.LIGHT_COLOUR_DATA_V2_VALUE_MIN, Math.round(dim * (this.LIGHT_COLOUR_DATA_V2_VALUE_MAX - this.LIGHT_COLOUR_DATA_V2_VALUE_MIN)))),
          },
        });
      }
    } else if (this.hasCapability('light_mode') && light_mode === 'temperature') {
      if (this.hasTuyaCapability('bright_value')) {
        commands.push({
          code: 'bright_value',
          value: Math.min(this.LIGHT_BRIGHT_VALUE_V1_MAX, Math.max(this.LIGHT_BRIGHT_VALUE_V1_MIN, Math.round(dim * (this.LIGHT_BRIGHT_VALUE_V1_MAX - this.LIGHT_BRIGHT_VALUE_V1_MIN)))),
        });
      }

      if (this.hasTuyaCapability('bright_value_v2')) {
        commands.push({
          code: 'bright_value_v2',
          value: Math.min(this.LIGHT_BRIGHT_VALUE_V2_MAX, Math.max(this.LIGHT_BRIGHT_VALUE_V2_MIN, Math.round(dim * (this.LIGHT_BRIGHT_VALUE_V2_MAX - this.LIGHT_BRIGHT_VALUE_V2_MIN)))),
        });
      }

      if (this.hasTuyaCapability('temp_value')) {
        commands.push({
          code: 'temp_value',
          value: Math.min(this.LIGHT_TEMP_VALUE_V1_MAX, Math.max(this.LIGHT_TEMP_VALUE_V1_MIN, Math.round((1 - light_temperature) * (this.LIGHT_TEMP_VALUE_V1_MAX - this.LIGHT_TEMP_VALUE_V1_MIN)))),
        });
      }

      if (this.hasTuyaCapability('temp_value_v2')) {
        commands.push({
          code: 'temp_value_v2',
          value: Math.min(this.LIGHT_TEMP_VALUE_V2_MAX, Math.max(this.LIGHT_TEMP_VALUE_V2_MIN, Math.round((1 - light_temperature) * (this.LIGHT_TEMP_VALUE_V2_MAX - this.LIGHT_TEMP_VALUE_V2_MIN)))),
        });
      }
    } else if (this.hasCapability('dim')) {
      commands.push({
        code: 'bright_value_v2',
        value: Math.min(this.LIGHT_BRIGHT_VALUE_V2_MAX, Math.max(this.LIGHT_BRIGHT_VALUE_V2_MIN, Math.round(dim * (this.LIGHT_BRIGHT_VALUE_V2_MAX - this.LIGHT_BRIGHT_VALUE_V2_MIN)))),
      });
    }

    if (commands.length) {
      await this.sendCommands(commands);
    }
  }

}

module.exports = TuyaOAuth2DeviceLight;
