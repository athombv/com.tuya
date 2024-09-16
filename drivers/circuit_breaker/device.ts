import TuyaOAuth2Device from '../../lib/TuyaOAuth2Device';
import { SettingsEvent, TuyaStatus } from '../../types/TuyaTypes';
import { constIncludes, filterTuyaSettings, getFromMap } from '../../lib/TuyaOAuth2Util';
import * as Util from '../../lib/TuyaOAuth2Util';
import {
  CIRCUIT_BREAKER_CAPABILITIES,
  CIRCUIT_BREAKER_CAPABILITIES_MAPPING,
  CIRCUIT_BREAKER_SETTING_LABELS,
  HomeyCircuitBreakerSettings,
  TuyaCircuitBreakerSettings,
} from './TuyaCircuitBreakerConstants';

module.exports = class TuyaOAuth2DeviceCircuitBreaker extends TuyaOAuth2Device {
  async onOAuth2Init(): Promise<void> {
    await super.onOAuth2Init();

    if (this.hasCapability('onoff')) {
      this.registerCapabilityListener('onoff', value => this.sendCommand({ code: 'switch', value }));
    }
  }

  async onTuyaStatus(status: TuyaStatus, changed: string[]): Promise<void> {
    await super.onTuyaStatus(status, changed);

    for (const tuyaCapability in status) {
      const homeyCapability = getFromMap(CIRCUIT_BREAKER_CAPABILITIES_MAPPING, tuyaCapability);
      const value = status[tuyaCapability];

      if (tuyaCapability === 'switch' && homeyCapability) {
        await this.safeSetCapabilityValue(homeyCapability, value);
      }

      if (constIncludes(CIRCUIT_BREAKER_CAPABILITIES.read_only_scaled, tuyaCapability) && homeyCapability) {
        const setting = `${homeyCapability}_scaling`;
        let scaling = 10.0 ** parseInt(this.getSetting(setting), 10);
        if (homeyCapability === 'measure_current') scaling *= 1000;
        await this.safeSetCapabilityValue(homeyCapability, (value as number) / scaling);
      }

      if (constIncludes(CIRCUIT_BREAKER_CAPABILITIES.setting, tuyaCapability)) {
        await this.safeSetSettingValue(tuyaCapability, value);
      }
    }
  }

  async onSettings(event: SettingsEvent<HomeyCircuitBreakerSettings>): Promise<string | void> {
    for (const tuyaCapability of CIRCUIT_BREAKER_CAPABILITIES.read_only_scaled) {
      const homeyCapability = CIRCUIT_BREAKER_CAPABILITIES_MAPPING[tuyaCapability];
      if (!homeyCapability) continue;
      await Util.handleScaleSetting(this, event, `${homeyCapability}_scaling`, homeyCapability).catch(this.error);
    }

    const tuyaSettings = filterTuyaSettings<HomeyCircuitBreakerSettings, TuyaCircuitBreakerSettings>(event, [
      'child_lock',
      'relay_status',
    ]);

    return Util.onSettings(this, tuyaSettings, CIRCUIT_BREAKER_SETTING_LABELS);
  }
};
