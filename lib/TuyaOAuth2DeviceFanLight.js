/* eslint-disable camelcase */

'use strict';

const TuyaOAuth2Device = require('./TuyaOAuth2Device');
const TuyaOAuth2Constants = require('./TuyaOAuth2Constants');

/**
 * Device Class for Tuya Lights
 * @extends TuyaOAuth2Device
 * @hideconstructor
 */
class TuyaOAuth2DeviceFanLight extends TuyaOAuth2Device {

  constructor(...props) {
    super(...props);

    this.onCapabilityOnOff = this.onCapabilityOnOff.bind(this);
    this.onCapabilityDim = this.onCapabilityDim.bind(this);
    this.onCapabilityFanOnOff = this.onCapabilityFanOnOff.bind(this);
    this.onCapabilityFanSet = this.onCapabilityFanSet.bind(this);
  }

  async onOAuth2Init() {
    await super.onOAuth2Init();

    // onoff
    if (this.hasCapability('onoff')) {
      this.registerCapabilityListener('onoff', this.onCapabilityOnOff);
    }
    // dim
    if (this.hasCapability('dim')) {
      this.registerCapabilityListener('dim', this.onCapabilityDim);
    }

    // volume_mute (TBC fan_onoff)
    if (this.hasCapability('volume_mute')) {
      this.registerCapabilityListener('volume_mute', this.onCapabilityFanOnOff);
    }
    // volume_set (TBC fan_set)
    if (this.hasCapability('volume_set')) {
      this.registerCapabilityListener('volume_set', this.onCapabilityFanSet);
    }
  }

  async onTuyaStatus(status) {
    await super.onTuyaStatus(status);

    // onoff
    if (typeof status['light'] === 'boolean') {
      this.setCapabilityValue('onoff', status['light']).catch(this.error);
    }

    // dim
    if (typeof status['bright_value'] === 'number') {
      this.setCapabilityValue('dim', status['bright_value']).catch(this.error);
    }

    // volume_mute (TBC fan_onoff)
    if (typeof status['switch'] === 'boolean') {
      this.setCapabilityValue('volume_mute', status['switch']).catch(this.error);
    }

    // volume_set (TBC fan_set)
    if (typeof status['fan_speed_percent'] === 'number') {
      this.setCapabilityValue('volume_set', status['fan_speed_percent']).catch(this.error);
    }
  }
  
  async onCapabilityOnOff(value) {
    await this.sendCommand({
      code: 'light',
      value: !!value,
    });
  }
  
  async onCapabilityDim(value) {
    await this.sendCommand({
      code: 'bright_value',
      value: value,
    });
  }
  
  async onCapabilityFanOnOff(value) {
    await this.sendCommand({
      code: 'switch',
      value: !!value,
    });
  }
  
  async onCapabilityFanSet(value) {
    await this.sendCommand({
      code: 'fan_speed_percent',
      value: value,
    });
  }
}

module.exports = TuyaOAuth2DeviceFanLight;
