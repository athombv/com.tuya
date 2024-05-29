/* eslint-disable camelcase */

'use strict';

const TuyaOAuth2Device = require('./TuyaOAuth2Device');
const TuyaOAuth2Constants = require('./TuyaOAuth2Constants');

const {
  LIGHT_COLOUR_DATA_V1_HUE_MIN,
  LIGHT_COLOUR_DATA_V1_HUE_MAX,
  LIGHT_COLOUR_DATA_V1_SATURATION_MIN,
  LIGHT_COLOUR_DATA_V1_SATURATION_MAX,
  LIGHT_COLOUR_DATA_V1_VALUE_MIN,
  LIGHT_COLOUR_DATA_V1_VALUE_MAX,

  LIGHT_COLOUR_DATA_V2_HUE_MIN,
  LIGHT_COLOUR_DATA_V2_HUE_MAX,
  LIGHT_COLOUR_DATA_V2_SATURATION_MIN,
  LIGHT_COLOUR_DATA_V2_SATURATION_MAX,
  LIGHT_COLOUR_DATA_V2_VALUE_MIN,
  LIGHT_COLOUR_DATA_V2_VALUE_MAX,

  LIGHT_TEMP_VALUE_V1_MIN,
  LIGHT_TEMP_VALUE_V1_MAX,
  LIGHT_TEMP_VALUE_V2_MIN,
  LIGHT_TEMP_VALUE_V2_MAX,

  LIGHT_BRIGHT_VALUE_V1_MIN,
  LIGHT_BRIGHT_VALUE_V1_MAX,

  LIGHT_BRIGHT_VALUE_V2_MIN,
  LIGHT_BRIGHT_VALUE_V2_MAX,
} = TuyaOAuth2Constants;

/**
 * Device Class for Tuya Lights
 * @extends TuyaOAuth2Device
 * @hideconstructor
 */
class TuyaOAuth2DeviceLight extends TuyaOAuth2Device {

  constructor(...props) {
    super(...props);

    this.onCapabilityOnOff = this.onCapabilityOnOff.bind(this);
    this.onCapabilitiesLight = this.onCapabilitiesLight.bind(this);
  }

  async onOAuth2Init() {
    await super.onOAuth2Init();

    // onoff
    if (this.hasCapability('onoff')) {
      this.registerCapabilityListener('onoff', this.onCapabilityOnOff);
    }

    // light capabilities
    const lightCapabilities = [];
    if (this.hasCapability('dim')) lightCapabilities.push('dim');
    if (this.hasCapability('light_hue')) lightCapabilities.push('light_hue');
    if (this.hasCapability('light_saturation')) lightCapabilities.push('light_saturation');
    if (this.hasCapability('light_temperature')) lightCapabilities.push('light_temperature');
    if (this.hasCapability('light_mode')) lightCapabilities.push('light_mode');

    if (lightCapabilities.length > 0) {
      this.registerMultipleCapabilityListener(lightCapabilities, this.onCapabilitiesLight, 150);
    }

    this.log(this.getStore());
  }

  async onTuyaStatus(status) {
    await super.onTuyaStatus(status);

    this.log(status);

    // onoff
    if (typeof status['switch_led'] === 'boolean') {
      this.setCapabilityValue('onoff', status['switch_led']).catch(this.error);
    }

    // light_temperature
    if (typeof status['temp_value'] === 'number') {
      const light_temperature = Math.min(1, Math.max(0, (status['temp_value'] - LIGHT_TEMP_VALUE_V1_MIN) / (LIGHT_TEMP_VALUE_V1_MAX - LIGHT_TEMP_VALUE_V1_MIN)));
      this.setCapabilityValue('light_temperature', light_temperature).catch(this.error);
    }

    if (typeof status['temp_value_v2'] === 'number') {
      const light_temperature = Math.min(1, Math.max(0, (status['temp_value_v2'] - LIGHT_TEMP_VALUE_V2_MIN) / (LIGHT_TEMP_VALUE_V2_MAX - LIGHT_TEMP_VALUE_V2_MIN)));
      this.setCapabilityValue('light_temperature', light_temperature).catch(this.error);
    }

    // light_hue, light_saturation
    if (status['colour_data']) {
      const light_hue = Math.min(1, Math.max(0, (status['colour_data']['h'] - LIGHT_COLOUR_DATA_V1_HUE_MIN) / (LIGHT_COLOUR_DATA_V1_HUE_MAX - LIGHT_COLOUR_DATA_V1_HUE_MIN)));
      this.setCapabilityValue('light_hue', light_hue).catch(this.error);

      const light_saturation = Math.min(1, Math.max(0, (status['colour_data']['s'] - LIGHT_COLOUR_DATA_V1_SATURATION_MIN) / (LIGHT_COLOUR_DATA_V1_SATURATION_MAX - LIGHT_COLOUR_DATA_V1_SATURATION_MIN)));
      this.setCapabilityValue('light_saturation', light_saturation).catch(this.error);
    }

    if (status['colour_data_v2']) {
      const light_hue = Math.min(1, Math.max(0, (status['colour_data_v2']['h'] - LIGHT_COLOUR_DATA_V2_HUE_MIN) / (LIGHT_COLOUR_DATA_V2_HUE_MAX - LIGHT_COLOUR_DATA_V2_HUE_MIN)));
      this.setCapabilityValue('light_hue', light_hue).catch(this.error);

      const light_saturation = Math.min(1, Math.max(0, (status['colour_data_v2']['s'] - LIGHT_COLOUR_DATA_V2_SATURATION_MIN) / (LIGHT_COLOUR_DATA_V2_SATURATION_MAX - LIGHT_COLOUR_DATA_V2_SATURATION_MIN)));
      this.setCapabilityValue('light_saturation', light_saturation).catch(this.error);
    }

    // light_mode
    if (status['work_mode']) {
      if (status['work_mode'] === 'colour') {
        this.setCapabilityValue('light_mode', 'color').catch(this.error);

        // dim
        if (status['colour_data']) {
          const dim = Math.min(1, Math.max(0, (status['colour_data']['v'] - LIGHT_COLOUR_DATA_V1_VALUE_MIN) / (LIGHT_COLOUR_DATA_V1_VALUE_MAX - LIGHT_COLOUR_DATA_V1_VALUE_MIN)));
          this.setCapabilityValue('dim', dim).catch(this.error);
        }

        if (status['colour_data_v2']) {
          const dim = Math.min(1, Math.max(0, (status['colour_data_v2']['v'] - LIGHT_COLOUR_DATA_V2_VALUE_MIN) / (LIGHT_COLOUR_DATA_V2_VALUE_MAX - LIGHT_COLOUR_DATA_V2_VALUE_MIN)));
          this.setCapabilityValue('dim', dim).catch(this.error);
        }
      }

      if (status['work_mode'] === 'white') {
        this.setCapabilityValue('light_mode', 'temperature').catch(this.error);

        // dim
        if (typeof status['bright_value'] === 'number') {
          const dim = Math.min(1, Math.max(0, (status['bright_value'] - LIGHT_BRIGHT_VALUE_V1_MIN) / (LIGHT_BRIGHT_VALUE_V1_MAX - LIGHT_BRIGHT_VALUE_V1_MIN)));
          this.setCapabilityValue('dim', dim).catch(this.error);
        }

        if (typeof status['bright_value_v2'] === 'number') {
          const dim = Math.min(1, Math.max(0, (status['bright_value_v2'] - LIGHT_BRIGHT_VALUE_V2_MIN) / (LIGHT_BRIGHT_VALUE_V2_MAX - LIGHT_BRIGHT_VALUE_V2_MIN)));
          this.setCapabilityValue('dim', dim).catch(this.error);
        }
      }
    } else {
      // dim
      if (typeof status['bright_value'] === 'number') {
        const dim = Math.min(1, Math.max(0, (status['bright_value'] - LIGHT_BRIGHT_VALUE_V1_MIN) / (LIGHT_BRIGHT_VALUE_V1_MAX - LIGHT_BRIGHT_VALUE_V1_MIN)));
        this.setCapabilityValue('dim', dim).catch(this.error);
      }

      if (typeof status['bright_value_v2'] === 'number') {
        const dim = Math.min(1, Math.max(0, (status['bright_value_v2'] - LIGHT_BRIGHT_VALUE_V2_MIN) / (LIGHT_BRIGHT_VALUE_V2_MAX - LIGHT_BRIGHT_VALUE_V2_MIN)));
        this.setCapabilityValue('dim', dim).catch(this.error);
      }
    }
  }

  async onCapabilityOnOff(value) {
    const { deviceId } = this.getData();
    await this.oAuth2Client.sendCommands({
      deviceId,
      commands: [{
        code: 'switch_led',
        value: !!value,
      }],
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
            h: Math.min(LIGHT_COLOUR_DATA_V1_HUE_MAX, Math.max(LIGHT_COLOUR_DATA_V1_HUE_MIN, Math.round(light_hue * (LIGHT_COLOUR_DATA_V1_HUE_MAX - LIGHT_COLOUR_DATA_V1_HUE_MIN)))),
            s: Math.min(LIGHT_COLOUR_DATA_V1_SATURATION_MAX, Math.max(LIGHT_COLOUR_DATA_V1_SATURATION_MIN, Math.round(light_saturation * (LIGHT_COLOUR_DATA_V1_SATURATION_MAX - LIGHT_COLOUR_DATA_V1_SATURATION_MIN)))),
            v: Math.min(LIGHT_COLOUR_DATA_V1_VALUE_MAX, Math.max(LIGHT_COLOUR_DATA_V1_VALUE_MIN, Math.round(dim * (LIGHT_COLOUR_DATA_V1_VALUE_MAX - LIGHT_COLOUR_DATA_V1_VALUE_MIN)))),
          },
        });
      }

      if (this.hasTuyaCapability('colour_data_v2')) {
        commands.push({
          code: 'colour_data_v2',
          value: {
            h: Math.min(LIGHT_COLOUR_DATA_V2_HUE_MAX, Math.max(LIGHT_COLOUR_DATA_V2_HUE_MIN, Math.round(light_hue * (LIGHT_COLOUR_DATA_V2_HUE_MAX - LIGHT_COLOUR_DATA_V2_HUE_MIN)))),
            s: Math.min(LIGHT_COLOUR_DATA_V2_SATURATION_MAX, Math.max(LIGHT_COLOUR_DATA_V2_SATURATION_MIN, Math.round(light_saturation * (LIGHT_COLOUR_DATA_V2_SATURATION_MAX - LIGHT_COLOUR_DATA_V2_SATURATION_MIN)))),
            v: Math.min(LIGHT_COLOUR_DATA_V2_VALUE_MAX, Math.max(LIGHT_COLOUR_DATA_V2_VALUE_MIN, Math.round(dim * (LIGHT_COLOUR_DATA_V2_VALUE_MAX - LIGHT_COLOUR_DATA_V2_VALUE_MIN)))),
          },
        });
      }
    } else if (this.hasCapability('light_mode') && light_mode === 'temperature') {
      if (this.hasTuyaCapability('bright_value')) {
        commands.push({
          code: 'bright_value',
          value: Math.min(LIGHT_BRIGHT_VALUE_V1_MAX, Math.max(LIGHT_BRIGHT_VALUE_V1_MIN, Math.round(dim * (LIGHT_BRIGHT_VALUE_V1_MAX - LIGHT_BRIGHT_VALUE_V1_MIN)))),
        });
      }

      if (this.hasTuyaCapability('bright_value_v2')) {
        commands.push({
          code: 'bright_value_v2',
          value: Math.min(LIGHT_BRIGHT_VALUE_V2_MAX, Math.max(LIGHT_BRIGHT_VALUE_V2_MIN, Math.round(dim * (LIGHT_BRIGHT_VALUE_V2_MAX - LIGHT_BRIGHT_VALUE_V2_MIN)))),
        });
      }

      if (this.hasTuyaCapability('temp_value')) {
        commands.push({
          code: 'temp_value',
          value: Math.min(LIGHT_TEMP_VALUE_V1_MAX, Math.max(LIGHT_TEMP_VALUE_V1_MIN, Math.round((1 - light_temperature) * (LIGHT_TEMP_VALUE_V1_MAX - LIGHT_TEMP_VALUE_V1_MIN)))),
        });
      }

      if (this.hasTuyaCapability('temp_value_v2')) {
        commands.push({
          code: 'temp_value_v2',
          value: Math.min(LIGHT_TEMP_VALUE_V2_MAX, Math.max(LIGHT_TEMP_VALUE_V2_MIN, Math.round((1 - light_temperature) * (LIGHT_TEMP_VALUE_V2_MAX - LIGHT_TEMP_VALUE_V2_MIN)))),
        });
      }
    } else if (this.hasCapability('dim')) {
      commands.push({
        code: 'bright_value_v2',
        value: Math.min(LIGHT_BRIGHT_VALUE_V2_MAX, Math.max(LIGHT_BRIGHT_VALUE_V2_MIN, Math.round(dim * (LIGHT_BRIGHT_VALUE_V2_MAX - LIGHT_BRIGHT_VALUE_V2_MIN)))),
      });
    }

    if (commands.length) {
      const { deviceId } = this.getData();
      await this.oAuth2Client.sendCommands({
        deviceId,
        commands,
      });
    }
  }

}

module.exports = TuyaOAuth2DeviceLight;
