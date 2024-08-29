import TuyaOAuth2Device from '../../lib/TuyaOAuth2Device';
import { TuyaStatus } from '../../types/TuyaTypes';
import { FAN_CAPABILITIES, FAN_CAPABILITIES_MAPPING } from './TuyaFanConstants';
import { constIncludes, getFromMap } from '../../lib/TuyaOAuth2Util';
import * as TuyaFanMigrations from '../../lib/migrations/TuyaFanMigrations';

export default class TuyaOAuth2DeviceFan extends TuyaOAuth2Device {
  async onOAuth2Init(): Promise<void> {
    await super.onOAuth2Init();

    for (const [tuyaCapability, capability] of Object.entries(FAN_CAPABILITIES_MAPPING)) {
      if (constIncludes(FAN_CAPABILITIES.read_write, tuyaCapability) && this.hasCapability(capability)) {
        this.registerCapabilityListener(capability, value => this.sendCommand({ code: tuyaCapability, value }));
      }
    }
  }

  async performMigrations(): Promise<void> {
    await super.performMigrations();
    await TuyaFanMigrations.performMigrations(this);
  }

  async onTuyaStatus(status: TuyaStatus, changedStatusCodes: string[]): Promise<void> {
    await super.onTuyaStatus(status, changedStatusCodes);

    for (const tuyaCapability in status) {
      const value = status[tuyaCapability];
      const homeyCapability = getFromMap(FAN_CAPABILITIES_MAPPING, tuyaCapability);

      if (
        (constIncludes(FAN_CAPABILITIES.read_write, tuyaCapability) ||
          constIncludes(FAN_CAPABILITIES.read_only, tuyaCapability)) &&
        homeyCapability
      ) {
        await this.safeSetCapabilityValue(homeyCapability, value);
      }
    }
  }
}

module.exports = TuyaOAuth2DeviceFan;
