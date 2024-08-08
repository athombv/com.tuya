'use strict';

const TuyaOAuth2Device = require('../../lib/TuyaOAuth2Device');

/**
 * Device Class for Tuya Heaters
 */
class TuyaOAuth2DeviceHeater extends TuyaOAuth2Device {

  async onOAuth2Init() {
    await super.onOAuth2Init();

    if (this.hasCapability('onoff')) {
      this.registerCapabilityListener('onoff', (value) => this.onOffCapabilityListener(value));
    }

    if (this.hasCapability('target_temperature')) {
      this.registerCapabilityListener('target_temperature', (value) => this.targetTemperatureCapabilityListener(value));
    }

    if (this.hasCapability('child_lock')) {
      this.registerCapabilityListener('child_lock', (value) => this.childLockCapabilityListener(value));
    }

    if (this.hasCapability('eco_mode')) {
      this.registerCapabilityListener('eco_mode', (value) => this.ecoModeCapabilityListener(value));
    }
  }

  async onTuyaStatus(status) {
    await super.onTuyaStatus(status);

    if (typeof status['switch'] === 'boolean') {
      this.setCapabilityValue('onoff', status['switch']).catch(this.error);
    }

    if (typeof status['temp_current'] === 'number') {
      this.setCapabilityValue('measure_temperature', status['temp_current']).catch(this.error);
    }

    if (typeof status['temp_set'] === 'number') {
      this.setCapabilityValue('target_temperature', status['temp_set']).catch(this.error);
    }

    if (typeof status['lock'] === 'boolean') {
      this.setCapabilityValue('child_lock', status['lock']).catch(this.error);
    }

    if (typeof status['work_power'] === 'number') {
      const cur_power = status['work_power'] / 10.0;
      this.setCapabilityValue('measure_power', cur_power).catch(this.error);
    }

    if (typeof status['mode_eco'] === 'boolean') {
      this.setCapabilityValue('eco_mode', status['mode_eco']).catch(this.error);
    }
  }

  async onOffCapabilityListener(value) {
    await this.sendCommand({
      code: 'switch',
      value: value,
    });
  }

  async targetTemperatureCapabilityListener(value) {
    const limitedTemperature = Math.max(0, Math.min(Math.floor(value), 50));
    await this.sendCommand({
      code: 'temp_set',
      value: limitedTemperature,
    });
  }

  async childLockCapabilityListener(value) {
    await this.sendCommand({
      code: 'lock',
      value: value,
    });
  }

  async ecoModeCapabilityListener(value) {
    await this.sendCommand({
      code: 'mode_eco',
      value: value,
    });
  }
}

module.exports = TuyaOAuth2DeviceHeater;
