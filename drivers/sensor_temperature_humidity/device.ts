import {
  HomeyTemperatureHumiditySensorSettings,
  TEMPERATURE_HUMIDITY_CAPABILITY_MAPPING,
  TEMPERATURE_HUMIDITY_SENSOR_CAPABILITIES,
  TEMPERATURE_HUMIDITY_SENSOR_SETTING_LABELS,
} from './TuyaTemperatureHumiditySensorConstants';
import TuyaOAuth2DeviceSensor from '../../lib/TuyaOAuth2DeviceSensor';
import { constIncludes } from '../../lib/TuyaOAuth2Util';
import { SettingsEvent, TuyaStatus } from '../../types/TuyaTypes';
import * as TuyaOAuth2Util from '../../lib/TuyaOAuth2Util';

module.exports = class TuyaOAuth2DeviceSensorTemperatureHumidity extends TuyaOAuth2DeviceSensor {
  async onOAuth2Init(): Promise<void> {
    await super.onOAuth2Init();

    if (this.hasCapability('onoff')) {
      this.registerCapabilityListener('onoff', value => this.sendCommand({ code: 'switch', value }));
    }
  }

  async onTuyaStatus(status: TuyaStatus, changedStatusCodes: string[]): Promise<void> {
    await super.onTuyaStatus(status, changedStatusCodes);

    for (const tuyaCapability in status) {
      const homeyCapability =
        TEMPERATURE_HUMIDITY_CAPABILITY_MAPPING[tuyaCapability as keyof typeof TEMPERATURE_HUMIDITY_CAPABILITY_MAPPING];
      const value = status[tuyaCapability];

      if (
        constIncludes(TEMPERATURE_HUMIDITY_SENSOR_CAPABILITIES.read_only, tuyaCapability) ||
        constIncludes(TEMPERATURE_HUMIDITY_SENSOR_CAPABILITIES.read_write, tuyaCapability)
      ) {
        this.setCapabilityValue(homeyCapability, value).catch(this.error);
      }

      if (constIncludes(TEMPERATURE_HUMIDITY_SENSOR_CAPABILITIES.read_only_scaled, tuyaCapability)) {
        const scaling = 10.0 ** Number.parseInt(this.getSetting(`${tuyaCapability}_scaling`) ?? '0', 10);
        this.setCapabilityValue(homeyCapability, (status[tuyaCapability] as number) / scaling).catch(this.error);
      }

      // Battery
      // battery_state is handled by superclass

      if (tuyaCapability === 'battery_value') {
        const scaledValue = (value as number) / 300;
        this.setCapabilityValue(homeyCapability, scaledValue).catch(this.error);
      }

      if (tuyaCapability === 'va_battery') {
        const scaledValue = (value as number) / 100;
        this.setCapabilityValue(homeyCapability, scaledValue).catch(this.error);
      }
    }
  }

  async onSettings(event: SettingsEvent<HomeyTemperatureHumiditySensorSettings>): Promise<string | void> {
    return await TuyaOAuth2Util.onSettings(this, event, TEMPERATURE_HUMIDITY_SENSOR_SETTING_LABELS);
  }
};
