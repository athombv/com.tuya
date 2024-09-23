import TuyaOAuth2Device from '../../lib/TuyaOAuth2Device';
import { TuyaStatus } from '../../types/TuyaTypes';
import { HUMIDIFIER_CAPABILITIES, HUMIDIFIER_CAPABILITY_MAPPING } from './TuyaHumidifierConstants';
import { constIncludes, getFromMap } from '../../lib/TuyaOAuth2Util';

module.exports = class TuyaOAuth2DeviceHumidifier extends TuyaOAuth2Device {
  async onOAuth2Init(): Promise<void> {
    await super.onOAuth2Init();

    for (const tuyaCapability of HUMIDIFIER_CAPABILITIES.read_write) {
      const homeyCapability = getFromMap(HUMIDIFIER_CAPABILITY_MAPPING, tuyaCapability);
      if (homeyCapability && this.hasCapability(homeyCapability)) {
        this.registerCapabilityListener(homeyCapability, value =>
          this.sendCommand({
            code: tuyaCapability,
            value: value,
          }),
        );
      }
    }
  }

  async onTuyaStatus(status: TuyaStatus, changed: string[]): Promise<void> {
    await super.onTuyaStatus(status, changed);

    for (const tuyaCapability in status) {
      const value = status[tuyaCapability];
      const homeyCapability = getFromMap(HUMIDIFIER_CAPABILITY_MAPPING, tuyaCapability);

      if (
        constIncludes(HUMIDIFIER_CAPABILITIES.read_write, tuyaCapability) ||
        constIncludes(HUMIDIFIER_CAPABILITIES.read_only, tuyaCapability)
      ) {
        await this.safeSetCapabilityValue(homeyCapability, value);
      }
    }
  }
};
