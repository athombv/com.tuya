import TuyaOAuth2Device from '../../lib/TuyaOAuth2Device';
import { ParsedColourData, TuyaStatus } from '../../types/TuyaTypes';
import { FAN_CAPABILITIES, FAN_CAPABILITIES_MAPPING } from './TuyaFanConstants';
import { constIncludes, getFromMap } from '../../lib/TuyaOAuth2Util';
import * as TuyaFanMigrations from '../../lib/migrations/TuyaFanMigrations';
import { TuyaCommand } from '../../types/TuyaApiTypes';

export default class TuyaOAuth2DeviceFan extends TuyaOAuth2Device {
  async onOAuth2Init(): Promise<void> {
    await super.onOAuth2Init();

    for (const [tuyaCapability, capability] of Object.entries(FAN_CAPABILITIES_MAPPING)) {
      if (constIncludes(FAN_CAPABILITIES.read_write, tuyaCapability) && this.hasCapability(capability)) {
        this.registerCapabilityListener(capability, value => this.sendCommand({ code: tuyaCapability, value }));
      }
    }

    // light capabilities
    const lightCapabilities = ['dim.light', 'light_hue', 'light_saturation', 'light_temperature', 'light_mode'].filter(
      lightCapability => this.hasCapability(lightCapability),
    );

    if (lightCapabilities.length > 0) {
      this.registerMultipleCapabilityListener(
        lightCapabilities,
        capabilityValues => this.onCapabilitiesLight(capabilityValues),
        150,
      );
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

    // Light
    const workMode = status['work_mode'] as 'white' | 'colour' | 'colourful' | undefined;
    const lightTemp = status['temp_value'] as number | undefined;
    const lightDim = status['bright_value'] as number | undefined;
    const lightColor = status['colour_data'] as ParsedColourData | undefined;

    if (workMode === 'white') {
      await this.safeSetCapabilityValue('light_mode', 'temperature');
    } else if (workMode === 'colour') {
      await this.safeSetCapabilityValue('light_mode', 'color');
    } else {
      await this.safeSetCapabilityValue('light_mode', null);
    }

    if (lightTemp) {
      const specs = this.store.tuya_temperature;
      const light_temperature = (lightTemp - specs.min) / (specs.max - specs.min);
      await this.safeSetCapabilityValue('light_temperature', light_temperature);
    }

    if (lightDim && (workMode === 'white' || workMode === undefined)) {
      const specs = this.store.tuya_brightness;
      const dim = (lightDim - specs.min) / (specs.max - specs.min);
      await this.safeSetCapabilityValue('dim.light', dim);
    }

    if (lightColor) {
      const specs = this.store.tuya_colour;
      const h = (lightColor.h - specs.h.min) / (specs.h.max - specs.h.min);
      const s = (lightColor.s - specs.s.min) / (specs.s.max - specs.s.min);

      await this.safeSetCapabilityValue('light_hue', h);
      await this.safeSetCapabilityValue('light_saturation', s);

      if (workMode === 'colour') {
        const v = (lightColor.v - specs.v.min) / (specs.v.max - specs.v.min);
        await this.safeSetCapabilityValue('dim.light', v);
      }
    }
  }

  async onCapabilitiesLight({
    light_dim = this.getCapabilityValue('dim.light'),
    light_mode = this.getCapabilityValue('light_mode'),
    light_hue = this.getCapabilityValue('light_hue'),
    light_saturation = this.getCapabilityValue('light_saturation'),
    light_temperature = this.getCapabilityValue('light_temperature'),
  }): Promise<void> {
    const commands: TuyaCommand[] = [];

    if (!light_mode) {
      if (this.hasCapability('light_hue')) {
        light_mode = 'color';
      } else {
        light_mode = 'temperature';
      }
    }

    if (this.hasTuyaCapability('work_mode')) {
      commands.push({
        code: 'work_mode',
        value: light_mode === 'color' ? 'colour' : 'white',
      });
    }

    if (light_mode === 'color') {
      const specs = this.store.tuya_colour;
      const h = specs.h.min + light_hue * (specs.h.max - specs.h.min);
      const s = specs.s.min + light_saturation * (specs.s.max - specs.s.min);
      const v = specs.v.min + light_dim * (specs.v.max - specs.v.min);

      commands.push({
        code: 'colour_data',
        value: { h, s, v },
      });
    } else {
      // Dim
      if (light_dim && this.hasTuyaCapability('bright_value')) {
        const specs = this.store.tuya_brightness;
        const brightValue = specs.min + light_dim * (specs.max - specs.min);

        commands.push({
          code: 'bright_value',
          value: brightValue,
        });
      }

      // Temperature
      if (light_temperature && this.hasTuyaCapability('temp_value')) {
        const specs = this.store.tuya_brightness;
        const tempValue = specs.min + light_temperature * (specs.max - specs.min);

        commands.push({
          code: 'temp_value',
          value: tempValue,
        });
      }
    }

    if (commands.length) {
      await this.sendCommands(commands);
    }
  }
}

module.exports = TuyaOAuth2DeviceFan;
