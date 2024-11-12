import TuyaOAuth2Device from '../../lib/TuyaOAuth2Device';
import { TuyaStatus } from '../../types/TuyaTypes';

module.exports = class TuyaOAuth2DeviceAirco extends TuyaOAuth2Device {
  async onOAuth2Init(): Promise<void> {
    await super.onOAuth2Init();

    if (this.hasCapability('onoff')) {
      this.registerCapabilityListener('onoff', value => this.onOffCapabilityListener(value));
    }

    if (this.hasCapability('target_temperature')) {
      this.registerCapabilityListener('target_temperature', value => this.targetTemperatureCapabilityListener(value));
    }

    if (this.hasCapability('target_humidity')) {
      this.registerCapabilityListener('target_humidity', value => this.targetHumidityCapabilityListener(value));
    }

    if (this.hasCapability('child_lock')) {
      this.registerCapabilityListener('child_lock', value => this.childLockCapabilityListener(value));
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

    if (typeof status['humidity_current'] === 'number') {
      const scaling = 10.0 ** Number.parseInt(this.getSetting('temp_current_scaling') ?? '0', 10);
      this.setCapabilityValue('measure_humidity', status['humidity_current'] / scaling).catch(this.error);
    }

    if (typeof status['humidity_set'] === 'number') {
      const scaling = 10.0 ** Number.parseInt(this.getSetting('temp_set_scaling') ?? '0', 10);
      this.setCapabilityValue('target_humidity', status['humidity_set'] / scaling).catch(this.error);
    }

    if (typeof status['lock'] === 'boolean') {
      this.setCapabilityValue('child_lock', status['lock']).catch(this.error);
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

  async targetHumidityCapabilityListener(value: number): Promise<void> {
    const scaling = 10.0 ** Number.parseInt(this.getSetting('humidity_set_scaling') ?? '0', 10);
    await this.sendCommand({
      code: 'humidity_set',
      value: value * scaling,
    });
  }

  async childLockCapabilityListener(value: boolean): Promise<void> {
    await this.sendCommand({
      code: 'lock',
      value: value,
    });
  }
};
