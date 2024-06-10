/* eslint-disable camelcase */

'use strict';

const TuyaOAuth2Device = require('./TuyaOAuth2Device');
const TuyaOAuth2Constants = require('./TuyaOAuth2Constants');

/**
 * Device Class for Tuya Lights
 * @extends TuyaOAuth2Device
 * @hideconstructor
 */
class TuyaOAuth2DeviceFan extends TuyaOAuth2Device {

  constructor(...props) {
    super(...props);

    this.onCapabilityOnOff = this.onCapabilityOnOff.bind(this);
    this.onCapabilityDim = this.onCapabilityDim.bind(this);
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
  }

  async onTuyaStatus(status) {
    await super.onTuyaStatus(status);

    // onoff
    if (typeof status['switch'] === 'boolean') {
      this.setCapabilityValue('onoff', status['switch']).catch(this.error);
    }

    // dim
    if (typeof status['fan_speed_percent'] === 'number') {
      this.setCapabilityValue('dim', status['fan_speed_percent']).catch(this.error);
    }
  }
  
  async onCapabilityOnOff(value) {
    await this.sendCommand({
      code: 'switch',
      value: !!value,
    });
  }
  
  async onCapabilityDim(value) {
    await this.sendCommand({
      code: 'fan_speed_percent',
      value: value,
    });
  }

}

module.exports = TuyaOAuth2DeviceFan;
