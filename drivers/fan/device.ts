/* eslint-disable camelcase */

import TuyaOAuth2Device from '../../lib/TuyaOAuth2Device';
import {TuyaStatus} from "../../types/TuyaTypes";

export default class TuyaOAuth2DeviceFan extends TuyaOAuth2Device {

  constructor(...props: any) {
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

  async onTuyaStatus(status: TuyaStatus, changedStatusCodes: string[]) {
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

  async onCapabilityOnOff(value: boolean) {
    await this.sendCommand({
      code: 'switch',
      value: value,
    });
  }

  async onCapabilityDim(value: number) {
    await this.sendCommand({
      code: 'fan_speed_percent',
      value: value,
    });
  }

}

module.exports = TuyaOAuth2DeviceFan;
