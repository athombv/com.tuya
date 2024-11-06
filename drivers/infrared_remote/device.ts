import TuyaOAuth2Device from '../../lib/TuyaOAuth2Device';

export default class TuyaOAuth2DeviceIrController extends TuyaOAuth2Device {
  async onOAuth2Init(): Promise<void> {
    await super.onOAuth2Init();

    if (this.hasCapability('on_button')) {
      this.registerCapabilityListener('on_button', () => this.sendKeyCommand(undefined, 'PowerOn').then());
    }

    if (this.hasCapability('off_button')) {
      this.registerCapabilityListener('off_button', () => this.sendKeyCommand(undefined, 'PowerOff').then());
    }

    if (this.hasCapability('power_button')) {
      this.registerCapabilityListener('power_button', () => this.sendKeyCommand(undefined, 'Power').then());
    }

    if (this.hasCapability('mute_button')) {
      this.registerCapabilityListener('mute_button', () =>
        this.sendKeyCommand(undefined, this.getStoreValue('tuya_mute_key')).then(),
      );
    }
  }

  async sendKeyCommand(keyId?: number, keyString?: string): Promise<boolean> {
    const { deviceId, controllerId } = this.getData();
    const categoryId = this.getStoreValue('tuya_remote_category') as number;
    return this.oAuth2Client.sendKeyCommand(controllerId, deviceId, categoryId, keyId, keyString);
  }

  async sendAircoCommand(code: string, value: number): Promise<boolean> {
    const { deviceId, controllerId } = this.getData();
    return this.oAuth2Client.sendAircoCommand(controllerId, deviceId, code, value);
  }
}

module.exports = TuyaOAuth2DeviceIrController;
