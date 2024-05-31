'use strict';

const TuyaOAuth2Device = require('./TuyaOAuth2Device');

/**
 * Device Class for Tuya Sockets
 */
class TuyaOAuth2DeviceSocket extends TuyaOAuth2Device {

  constructor(...props) {
    super(...props);

    this.onCapabilityOnOff = this.onCapabilityOnOff.bind(this);
    this.onCapabilityOnOff2 = this.onCapabilityOnOff2.bind(this);
    this.onCapabilityOnOff3 = this.onCapabilityOnOff3.bind(this);
    this.onCapabilityOnOff4 = this.onCapabilityOnOff4.bind(this);
    this.onCapabilityOnOff5 = this.onCapabilityOnOff5.bind(this);
    this.onCapabilityOnOff6 = this.onCapabilityOnOff6.bind(this);
  }

  async onOAuth2Init() {
    await super.onOAuth2Init();

    // onoff
    if (this.hasCapability('onoff')) {
      this.registerCapabilityListener('onoff', this.onCapabilityOnOff);
    }

    if (this.hasCapability('onoff.switch_2')) {
      this.registerCapabilityListener('onoff.switch_2', this.onCapabilityOnOff2);
    }

    if (this.hasCapability('onoff.switch_3')) {
      this.registerCapabilityListener('onoff.switch_3', this.onCapabilityOnOff3);
    }

    if (this.hasCapability('onoff.switch_4')) {
      this.registerCapabilityListener('onoff.switch_4', this.onCapabilityOnOff4);
    }

    if (this.hasCapability('onoff.switch_5')) {
      this.registerCapabilityListener('onoff.switch_5', this.onCapabilityOnOff5);
    }

    if (this.hasCapability('onoff.switch_6')) {
      this.registerCapabilityListener('onoff.switch_6', this.onCapabilityOnOff6);
    }
  }

  async onTuyaStatus(status) {
    await super.onTuyaStatus(status);

    // onoff
    if (typeof status['switch_1'] === 'boolean') {
      this.setCapabilityValue('onoff', status['switch_1']).catch(this.error);
    }

    if (typeof status['switch_2'] === 'boolean') {
      this.setCapabilityValue('onoff.switch_2', status['switch_2']).catch(this.error);
    }

    if (typeof status['switch_3'] === 'boolean') {
      this.setCapabilityValue('onoff.switch_3', status['switch_3']).catch(this.error);
    }

    if (typeof status['switch_4'] === 'boolean') {
      this.setCapabilityValue('onoff.switch_4', status['switch_4']).catch(this.error);
    }

    if (typeof status['switch_5'] === 'boolean') {
      this.setCapabilityValue('onoff.switch_5', status['switch_5']).catch(this.error);
    }

    if (typeof status['switch_6'] === 'boolean') {
      this.setCapabilityValue('onoff.switch_6', status['switch_6']).catch(this.error);
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

  async onCapabilityOnOff2(value) {
    const { deviceId } = this.getData();
    await this.oAuth2Client.sendCommands({
      deviceId,
      commands: [{
        code: 'switch_2',
        value: !!value,
      }],
    });
  }

  async onCapabilityOnOff3(value) {
    const { deviceId } = this.getData();
    await this.oAuth2Client.sendCommands({
      deviceId,
      commands: [{
        code: 'switch_3',
        value: !!value,
      }],
    });
  }

  async onCapabilityOnOff4(value) {
    const { deviceId } = this.getData();
    await this.oAuth2Client.sendCommands({
      deviceId,
      commands: [{
        code: 'switch_4',
        value: !!value,
      }],
    });
  }

  async onCapabilityOnOff5(value) {
    const { deviceId } = this.getData();
    await this.oAuth2Client.sendCommands({
      deviceId,
      commands: [{
        code: 'switch_5',
        value: !!value,
      }],
    });
  }

  async onCapabilityOnOff6(value) {
    const { deviceId } = this.getData();
    await this.oAuth2Client.sendCommands({
      deviceId,
      commands: [{
        code: 'switch_6',
        value: !!value,
      }],
    });
  }

}

module.exports = TuyaOAuth2DeviceSocket;
