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
  }

  async onOAuth2Init() {
    await super.onOAuth2Init();

    // onoff
    if (this.hasCapability('onoff')) {
      this.registerCapabilityListener('onoff', this.onCapabilityOnOff);
    }
  }

  async onTuyaStatus(status) {
    await super.onTuyaStatus(status);

    // onoff
    if (typeof status['switch'] === 'boolean') {
      this.setCapabilityValue('onoff', status['switch']).catch(this.error);
    }
  }

  async onCapabilityOnOff(value) {
    const { deviceId } = this.getData();
    await this.oAuth2Client.sendCommands({
      deviceId,
      commands: [{
        code: 'switch',
        value: !!value,
      }],
    });
  }

}

module.exports = TuyaOAuth2DeviceFan;
