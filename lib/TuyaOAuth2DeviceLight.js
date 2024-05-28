/* eslint-disable camelcase */

'use strict';

const TuyaOAuth2Device = require('./TuyaOAuth2Device');

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
  }

  async onTuyaStatus(status) {
    await super.onTuyaStatus(status);

    // onoff
    if (typeof status['switch_led'] === 'boolean') {
      this.setCapabilityValue('onoff', status['switch_led']).catch(this.error);
    }

    // light_temperature
    if (typeof status['temp_value_v2'] === 'number') {
      const light_temperature = Math.min(1, Math.max(0, (1000 - status['temp_value_v2']) / 1000));
      this.setCapabilityValue('light_temperature', light_temperature).catch(this.error);
    }

    // light_hue, light_saturation
    if (status['colour_data_v2']) {
      const light_hue = Math.min(1, Math.max(0, status['colour_data_v2']['h'] / 360));
      this.setCapabilityValue('light_hue', light_hue).catch(this.error);

      const light_saturation = Math.min(1, Math.max(0, status['colour_data_v2']['s'] / 1000));
      this.setCapabilityValue('light_saturation', light_saturation).catch(this.error);
    }

    // light_mode
    if (status['work_mode']) {
      if (status['work_mode'] === 'colour') {
        this.setCapabilityValue('light_mode', 'color').catch(this.error);

        // dim
        if (status['colour_data_v2']) {
          const dim = Math.min(1, Math.max(0, (status['colour_data_v2']['v'] - 10) / 990));
          this.setCapabilityValue('dim', dim).catch(this.error);
        }
      }

      if (status['work_mode'] === 'white') {
        this.setCapabilityValue('light_mode', 'temperature').catch(this.error);

        // dim
        if (typeof status['bright_value_v2'] === 'number') {
          const dim = Math.min(1, Math.max(0, (status['bright_value_v2'] - 10) / 990));
          this.setCapabilityValue('dim', dim).catch(this.error);
        }
      }
    } else {
      // dim
      if (typeof status['bright_value_v2'] === 'number') {
        const dim = Math.min(1, Math.max(0, (status['bright_value_v2'] - 10) / 990));
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
      const h = Math.min(360, Math.max(0, Math.round(light_hue * 360)));
      const s = Math.min(1000, Math.max(0, Math.round(light_saturation * 1000)));
      const v = Math.min(1000, Math.max(0, Math.round(dim * 1000)));

      commands.push({
        code: 'colour_data_v2',
        value: { h, s, v },
      });
    } else if (this.hasCapability('light_mode') && light_mode === 'temperature') {
      commands.push({
        code: 'bright_value_v2',
        value: Math.min(1000, Math.max(10, Math.round(10 + dim * 990))),
      });
      commands.push({
        code: 'temp_value_v2',
        value: Math.min(1000, Math.max(0, Math.round(1000 - light_temperature * 1000))),
      });
    } else if (this.hasCapability('dim')) {
      commands.push({
        code: 'bright_value_v2',
        value: Math.min(1000, Math.max(10, Math.round(10 + dim * 990))),
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
