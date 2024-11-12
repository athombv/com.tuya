import TuyaOAuth2Device from '../../lib/TuyaOAuth2Device';
import * as Util from '../../lib/TuyaOAuth2Util';
import { SettingsEvent, TuyaStatus } from '../../types/TuyaTypes';
import {
  DEHUMIDIFIER_CAPABILITIES,
  DEHUMIDIFIER_CAPABILITY_MAPPING,
  HomeyDehumidifierSettings,
} from './DehumidifierConstants';
import { constIncludes, getFromMap } from '../../lib/TuyaOAuth2Util';

module.exports = class TuyaOAuth2DeviceDehumidifier extends TuyaOAuth2Device {
  async onOAuth2Init(): Promise<void> {
    await super.onOAuth2Init();

    for (const tuyaCapability of DEHUMIDIFIER_CAPABILITIES.read_write) {
      const homeyCapability = DEHUMIDIFIER_CAPABILITY_MAPPING[tuyaCapability];
      this.registerCapabilityListener(homeyCapability, value => this.sendCommand({ code: tuyaCapability, value }));
    }
  }

  async onTuyaStatus(status: TuyaStatus, changed: string[]): Promise<void> {
    await super.onTuyaStatus(status, changed);

    for (const tuyaCapability in status) {
      const value = status[tuyaCapability];
      const homeyCapability = getFromMap(DEHUMIDIFIER_CAPABILITY_MAPPING, tuyaCapability);

      if (constIncludes(DEHUMIDIFIER_CAPABILITIES.read_write, tuyaCapability)) {
        await this.safeSetCapabilityValue(homeyCapability, value);
      }

      if (constIncludes(DEHUMIDIFIER_CAPABILITIES.read_only_scaled, tuyaCapability)) {
        const scaling = 10.0 ** Number.parseInt(this.getSetting(`${homeyCapability}_scaling`) ?? '0', 10);
        await this.safeSetCapabilityValue(homeyCapability, (status[tuyaCapability] as number) / scaling);
      }
    }
  }

  async onSettings(event: SettingsEvent<HomeyDehumidifierSettings>): Promise<string | void> {
    for (const tuyaCapability of DEHUMIDIFIER_CAPABILITIES.read_only_scaled) {
      const homeyCapability = DEHUMIDIFIER_CAPABILITY_MAPPING[tuyaCapability];
      await Util.handleScaleSetting(this, event, `${homeyCapability}_scaling`, homeyCapability).catch(this.error);
    }
  }
};
