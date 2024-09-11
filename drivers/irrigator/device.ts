import TuyaOAuth2Device from '../../lib/TuyaOAuth2Device';
import type { SettingsEvent, TuyaStatus } from '../../types/TuyaTypes';
import {
  HomeyIrrigatorSettings,
  IRRIGATOR_CAPABILITIES,
  IRRIGATOR_CAPABILITIES_MAPPING,
} from './TuyaIrrigatorConstants';
import { constIncludes, getFromMap, handleScaleSetting } from '../../lib/TuyaOAuth2Util';

module.exports = class TuyaOAuth2DeviceIrrigator extends TuyaOAuth2Device {
  async onOAuth2Init(): Promise<void> {
    await super.onOAuth2Init();

    if (this.hasCapability('onoff')) {
      this.registerCapabilityListener('onoff', value => this.sendCommand({ code: 'switch', value }));
    }
  }

  async onTuyaStatus(status: TuyaStatus, changedStatusCodes: string[]): Promise<void> {
    await super.onTuyaStatus(status, changedStatusCodes);

    for (const tuyaCapability in status) {
      const homeyCapability = getFromMap(IRRIGATOR_CAPABILITIES_MAPPING, tuyaCapability);
      const value = status[tuyaCapability];

      if (
        (constIncludes(IRRIGATOR_CAPABILITIES.read_only, tuyaCapability) ||
          constIncludes(IRRIGATOR_CAPABILITIES.read_write, tuyaCapability)) &&
        homeyCapability
      ) {
        await this.safeSetCapabilityValue(homeyCapability, value);
      }

      if (constIncludes(IRRIGATOR_CAPABILITIES.read_only_scaled, tuyaCapability) && homeyCapability) {
        const scaling = 10.0 ** Number.parseInt(this.getSetting(`${homeyCapability}_scaling`) ?? '0', 10);
        await this.safeSetCapabilityValue(homeyCapability, (value as number) / scaling);
      }

      if (tuyaCapability === 'rain_sensor_state' && homeyCapability) {
        const isRaining = value === 'rain';
        await this.safeSetCapabilityValue(homeyCapability, isRaining);
        if (changedStatusCodes.includes(tuyaCapability)) {
          await this.homey.flow
            .getDeviceTriggerCard(`irrigator_rain_sensor_${isRaining}`)
            .trigger(this)
            .catch(this.error);
        }
      }

      if (['rain_battery_percentage', 'temp_hum_battery_percentage'].includes(tuyaCapability)) {
        await this.homey.flow
          .getDeviceTriggerCard(`irrigator_${homeyCapability}_changed`)
          .trigger(this, { value: status[tuyaCapability] })
          .catch(this.error);
      }
    }
  }

  async onSettings(event: SettingsEvent<HomeyIrrigatorSettings>): Promise<string | void> {
    for (const tuyaCapability of IRRIGATOR_CAPABILITIES.read_only_scaled) {
      const homeyCapability = IRRIGATOR_CAPABILITIES_MAPPING[tuyaCapability];
      await handleScaleSetting(this, event, `${homeyCapability}_scaling`, homeyCapability).catch(this.error);
    }
  }
};
