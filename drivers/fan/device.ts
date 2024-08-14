import TuyaOAuth2Device from '../../lib/TuyaOAuth2Device';
import { TuyaStatus } from '../../types/TuyaTypes';

module.exports = class TuyaOAuth2DeviceFan extends TuyaOAuth2Device {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(...props: any) {
    super(...props);

    this.onCapabilityOnOff = this.onCapabilityOnOff.bind(this);
    this.onCapabilityDim = this.onCapabilityDim.bind(this);
  }

  async onOAuth2Init(): Promise<void> {
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

  async onTuyaStatus(status: TuyaStatus, changedStatusCodes: string[]): Promise<void> {
    await super.onTuyaStatus(status, changedStatusCodes);

    // onoff
    if (typeof status['switch'] === 'boolean') {
      this.setCapabilityValue('onoff', status['switch']).catch(this.error);
    }

    // dim
    if (typeof status['fan_speed_percent'] === 'number') {
      this.setCapabilityValue('dim', status['fan_speed_percent']).catch(this.error);
    }
  }

  async onCapabilityOnOff(value: boolean): Promise<void> {
    await this.sendCommand({
      code: 'switch',
      value: value,
    });
  }

  async onCapabilityDim(value: number): Promise<void> {
    await this.sendCommand({
      code: 'fan_speed_percent',
      value: value,
    });
  }
};
