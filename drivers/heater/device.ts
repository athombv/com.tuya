import TuyaOAuth2Device from '../../lib/TuyaOAuth2Device';
import { TuyaStatus } from '../../types/TuyaTypes';

module.exports = class TuyaOAuth2DeviceHeater extends TuyaOAuth2Device {
  async onOAuth2Init(): Promise<void> {
    await super.onOAuth2Init();

    if (this.hasCapability('onoff')) {
      this.registerCapabilityListener('onoff', value => this.onOffCapabilityListener(value));
    }

    if (this.hasCapability('target_temperature')) {
      this.registerCapabilityListener('target_temperature', value => this.targetTemperatureCapabilityListener(value));
    }

    if (this.hasCapability('child_lock')) {
      this.registerCapabilityListener('child_lock', value => this.childLockCapabilityListener(value));
    }

    if (this.hasCapability('eco_mode')) {
      this.registerCapabilityListener('eco_mode', value => this.ecoModeCapabilityListener(value));
    }
  }

  async onTuyaStatus(status: TuyaStatus, changedStatusCodes: string[]): Promise<void> {
    await super.onTuyaStatus(status, changedStatusCodes);

    if (typeof status['switch'] === 'boolean') {
      this.setCapabilityValue('onoff', status['switch']).catch(this.error);
    }

    if (typeof status['temp_current'] === 'number') {
      const scaling = 10.0 ** Number.parseInt(this.getSetting('temp_current_scaling') ?? '0', 10);
      this.setCapabilityValue('measure_temperature', status['temp_current'] / scaling).catch(this.error);
    }

    if (typeof status['temp_set'] === 'number') {
      const scaling = 10.0 ** Number.parseInt(this.getSetting('temp_set_scaling') ?? '0', 10);
      this.setCapabilityValue('target_temperature', status['temp_set'] / scaling).catch(this.error);
    }

    if (typeof status['lock'] === 'boolean') {
      this.setCapabilityValue('child_lock', status['lock']).catch(this.error);
    }

    if (typeof status['work_power'] === 'number') {
      const scaling = 10.0 ** Number.parseInt(this.getSetting('work_power_scaling') ?? '0', 10);
      this.setCapabilityValue('measure_power', status['work_power'] / scaling).catch(this.error);
    }

    if (typeof status['mode_eco'] === 'boolean') {
      this.setCapabilityValue('eco_mode', status['mode_eco']).catch(this.error);
    }
  }

  async onOffCapabilityListener(value: boolean): Promise<void> {
    await this.sendCommand({
      code: 'switch',
      value: value,
    });
  }

  async targetTemperatureCapabilityListener(value: number): Promise<void> {
    const scaling = 10.0 ** Number.parseInt(this.getSetting('temp_set_scaling') ?? '0', 10);
    await this.sendCommand({
      code: 'temp_set',
      value: value * scaling,
    });
  }

  async childLockCapabilityListener(value: boolean): Promise<void> {
    await this.sendCommand({
      code: 'lock',
      value: value,
    });
  }

  async ecoModeCapabilityListener(value: boolean): Promise<void> {
    await this.sendCommand({
      code: 'mode_eco',
      value: value,
    });
  }
};
