'use strict';

const TuyaOAuth2Device = require('./TuyaOAuth2Device');

/**
 * Device Class for Tuya Sockets
 */
class TuyaOAuth2DeviceSocket extends TuyaOAuth2Device {

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

    // TODO: Multiple sockets (?)
  }

  async onTuyaStatus(status) {
    await super.onTuyaStatus(status);

    // onoff
    if (typeof status['switch_1'] === 'boolean') {
      this.setCapabilityValue('onoff', status['switch_1']).catch(this.error);
    }
  }

  async onCapabilityOnOff(value) {
    const { deviceId } = this.getData();
    await this.oAuth2Client.sendCommands({
      deviceId,
      commands: [{
        code: 'switch_1',
        value: !!value,
      }],
    });
  }

}

module.exports = TuyaOAuth2DeviceSocket;
