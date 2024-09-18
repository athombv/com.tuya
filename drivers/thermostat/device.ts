import TuyaOAuth2Device from '../../lib/TuyaOAuth2Device';
import * as Util from '../../lib/TuyaOAuth2Util';
import { SettingsEvent, TuyaStatus } from '../../types/TuyaTypes';
import { constIncludes, filterTuyaSettings, getFromMap } from '../../lib/TuyaOAuth2Util';
import {
  HomeyThermostatSettings,
  THERMOSTAT_CAPABILITIES,
  THERMOSTAT_CAPABILITIES_MAPPING,
  THERMOSTAT_FLOWS,
  THERMOSTAT_SETTING_LABELS,
  TuyaThermostatSettings,
} from './TuyaThermostatConstants';

module.exports = class TuyaOAuth2DeviceThermostat extends TuyaOAuth2Device {
  async onOAuth2Init(): Promise<void> {
    await super.onOAuth2Init();

    for (const tuyaCapability of THERMOSTAT_CAPABILITIES.read_write) {
      const homeyCapability = THERMOSTAT_CAPABILITIES_MAPPING[tuyaCapability];
      if (this.hasCapability(homeyCapability)) {
        this.registerCapabilityListener(homeyCapability, value => this.sendCommand({ code: tuyaCapability, value }));
      }
    }

    if (this.hasCapability('target_temperature')) {
      this.registerCapabilityListener('target_temperature', value => {
        const setting = 'target_temperature_scaling';
        const scaling = 10.0 ** parseInt(this.getSetting(setting), 10);
        return this.sendCommand({ code: 'temp_set', value: Math.round(value * scaling) });
      });
    }
  }

  async onTuyaStatus(status: TuyaStatus, changed: string[]): Promise<void> {
    await super.onTuyaStatus(status, changed);

    for (const tuyaCapability in status) {
      const value = status[tuyaCapability];
      const homeyCapability = getFromMap(THERMOSTAT_CAPABILITIES_MAPPING, tuyaCapability);

      if (
        constIncludes(THERMOSTAT_CAPABILITIES.read_write, tuyaCapability) ||
        constIncludes(THERMOSTAT_CAPABILITIES.read_only, tuyaCapability)
      ) {
        await this.safeSetCapabilityValue(homeyCapability, value);
      }

      if (constIncludes(THERMOSTAT_CAPABILITIES.read_scaled, tuyaCapability)) {
        const setting = `${homeyCapability}_scaling`;
        const scaling = 10.0 ** parseInt(this.getSetting(setting), 10);
        await this.safeSetCapabilityValue(homeyCapability, (value as number) / scaling);
      }

      if (constIncludes(THERMOSTAT_CAPABILITIES.setting, tuyaCapability)) {
        await this.safeSetSettingValue(tuyaCapability, value);
      }

      if (tuyaCapability === 'work_state' && !this.hasTuyaCapability('mode')) {
        await this.safeSetCapabilityValue(homeyCapability, value);
      }
    }

    for (const tuyaCapability of changed) {
      if (constIncludes(THERMOSTAT_FLOWS.boolean_capability_trigger, tuyaCapability)) {
        const value = status[tuyaCapability] as boolean;
        const homeyCapability = getFromMap(THERMOSTAT_CAPABILITIES_MAPPING, tuyaCapability);
        await this.homey.flow
          .getDeviceTriggerCard(`thermostat_${homeyCapability}_${value}`)
          .trigger(this)
          .catch(this.error);
      }
    }
  }

  async onSettings(event: SettingsEvent<HomeyThermostatSettings>): Promise<string | void> {
    for (const homeyCapability of [
      'target_temperature',
      'measure_temperature',
      'measure_humidity',
      'measure_power',
    ] as const) {
      await Util.handleScaleSetting(this, event, `${homeyCapability}_scaling`, homeyCapability).catch(this.error);
    }

    const tuyaSettings = filterTuyaSettings<HomeyThermostatSettings, TuyaThermostatSettings>(
      event,
      THERMOSTAT_CAPABILITIES.setting,
    );

    return Util.onSettings(this, tuyaSettings, THERMOSTAT_SETTING_LABELS);
  }
};
