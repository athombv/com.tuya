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
      this.setCapabilityValue('measure_temperature', status['temp_current']).catch(this.error);
    }

    if (typeof status['temp_set'] === 'number') {
      this.setCapabilityValue('target_temperature', status['temp_set']).catch(this.error);
    }

    if (typeof status['lock'] === 'boolean') {
      this.setCapabilityValue('child_lock', status['lock']).catch(this.error);
    }

    if (typeof status['child_lock'] === 'boolean') {
      this.setCapabilityValue('child_lock', status['child_lock']).catch(this.error);
    }

    if (typeof status['work_power'] === 'number') {
      const cur_power = status['work_power'] / 10.0;
      this.setCapabilityValue('measure_power', cur_power).catch(this.error);
    }

    if (typeof status['mode_eco'] === 'boolean') {
      this.setCapabilityValue('eco_mode', status['mode_eco']).catch(this.error);
    }

    if (typeof status['eco'] === 'boolean') {
      this.setCapabilityValue('eco_mode', status['eco']).catch(this.error);
    }

    const faultOptions = this.store.tuya_heater_fault_capabilities;
    if (typeof status['fault'] === 'number' && faultOptions) {
      const fault = status['fault'];
      const faults = [];

      for (let i = 0; i < faultOptions.length; i++) {
        if (fault & (1 << i)) {
          faults.push(faultOptions[i]);
        }
      }

      const faultString = faults.join(', ');

      this.setCapabilityValue('fault', faults.length === 0 ? 'OK' : faultString).catch(this.error);
    }
  }

  async onOffCapabilityListener(value: boolean): Promise<void> {
    await this.sendCommand({
      code: 'switch',
      value: value,
    });
  }

  async targetTemperatureCapabilityListener(value: number): Promise<void> {
    const limitedTemperature = Math.max(0, Math.min(Math.floor(value), 50));
    await this.sendCommand({
      code: 'temp_set',
      value: limitedTemperature,
    });
  }

  async childLockCapabilityListener(value: boolean): Promise<void> {
    if (this.hasTuyaCapability('lock')) {
      await this.sendCommand({
        code: 'lock',
        value: value,
      });
    } else if (this.hasTuyaCapability('child_lock')) {
      await this.sendCommand({
        code: 'child_lock',
        value: value,
      });
    }
  }

  async ecoModeCapabilityListener(value: boolean): Promise<void> {
    if (this.hasTuyaCapability('eco')) {
      await this.sendCommand({
        code: 'eco',
        value: value,
      });
    } else if (this.hasTuyaCapability('mode_eco')) {
      await this.sendCommand({
        code: 'mode_eco',
        value: value,
      });
    }
  }
};
