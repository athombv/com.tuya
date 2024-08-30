import {
  HomeyClimateSensorSettings,
  CLIMATE_CAPABILITY_MAPPING,
  CLIMATE_SENSOR_CAPABILITIES,
  CLIMATE_SENSOR_SETTING_LABELS,
} from './TuyaClimateSensorConstants';
import TuyaOAuth2DeviceSensor from '../../lib/TuyaOAuth2DeviceSensor';
import { constIncludes, getFromMap } from '../../lib/TuyaOAuth2Util';
import { SettingsEvent, TuyaStatus } from '../../types/TuyaTypes';
import * as TuyaOAuth2Util from '../../lib/TuyaOAuth2Util';

module.exports = class TuyaOAuth2DeviceSensorClimate extends TuyaOAuth2DeviceSensor {
  async onOAuth2Init(): Promise<void> {
    await super.onOAuth2Init();

    if (this.hasCapability('onoff')) {
      this.registerCapabilityListener('onoff', value => this.sendCommand({ code: 'switch', value }));
    }
  }

  async onTuyaStatus(status: TuyaStatus, changedStatusCodes: string[]): Promise<void> {
    // battery_state, battery_percentage and temper_alarm are handled by the superclass
    await super.onTuyaStatus(status, changedStatusCodes);

    for (const tuyaCapability in status) {
      const homeyCapability = getFromMap(CLIMATE_CAPABILITY_MAPPING, tuyaCapability);
      const value = status[tuyaCapability];

      if (
        (constIncludes(CLIMATE_SENSOR_CAPABILITIES.read_only, tuyaCapability) ||
          constIncludes(CLIMATE_SENSOR_CAPABILITIES.read_write, tuyaCapability)) &&
        homeyCapability
      ) {
        await this.safeSetCapabilityValue(homeyCapability, value);
      }

      if (constIncludes(CLIMATE_SENSOR_CAPABILITIES.read_only_scaled, tuyaCapability) && homeyCapability) {
        const scaling = 10.0 ** Number.parseInt(this.getSetting(`${tuyaCapability}_scaling`) ?? '0', 10);
        await this.safeSetCapabilityValue(homeyCapability, (status[tuyaCapability] as number) / scaling);
      }

      // Battery
      if (tuyaCapability === 'battery_value' && homeyCapability) {
        const scaledValue = (value as number) / 300;
        await this.safeSetCapabilityValue(homeyCapability, scaledValue);
      }

      if (tuyaCapability === 'va_battery' && homeyCapability) {
        const scaledValue = (value as number) / 100;
        await this.safeSetCapabilityValue(homeyCapability, scaledValue);
      }
    }
  }

  async onSettings(event: SettingsEvent<HomeyClimateSensorSettings>): Promise<string | void> {
    return await TuyaOAuth2Util.onSettings(this, event, CLIMATE_SENSOR_SETTING_LABELS);
  }
};
