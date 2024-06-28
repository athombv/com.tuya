'use strict';

const TuyaOAuth2Device = require('./TuyaOAuth2Device');

/**
 * Device Class for Tuya Sockets
 */
class TuyaOAuth2DeviceSocket extends TuyaOAuth2Device {

  async onOAuth2Init() {
    await super.onOAuth2Init();

    // onoff
    if (this.hasCapability('onoff')) {
      this.registerCapabilityListener('onoff', (value) => this.allOnOff(value));
    }

    for (let switch_i = 1; switch_i <= 6; switch_i++) {
      if (this.hasCapability(`onoff.switch_${switch_i}`)) {
        this.registerCapabilityListener(`onoff.switch_${switch_i}`, (value) => this.onCapabilityOnOff(value, switch_i));
      }
    }
  }

  async safeSetCapabilityValue(capabilityId, value) {
    if (this.hasCapability(capabilityId)) {
      await this.setCapabilityValue(capabilityId, value);
    }
  }

  async onTuyaStatus(status) {
    await super.onTuyaStatus(status);

    // onoff
    let anySwitchOn = false;

    for (let switch_i = 1; switch_i <= 6; switch_i++) {
      const switchStatus = status[`switch_${switch_i}`];
      const switchCapability = `onoff.switch_${switch_i}`;

      if (typeof switchStatus === 'boolean') {
        anySwitchOn = anySwitchOn || switchStatus;
        this.safeSetCapabilityValue(switchCapability, switchStatus).catch(this.error);
      }
    }

    this.safeSetCapabilityValue('onoff', anySwitchOn).catch(this.error);

    if (typeof status['cur_power'] === 'number') {
      const cur_power = status['cur_power'];
      this.setCapabilityValue('measure_power', cur_power).catch(this.error);
    }

    if (typeof status['cur_voltage'] === 'number') {
      const cur_voltage = status['cur_voltage'] / 10.0;
      this.setCapabilityValue('measure_voltage', cur_voltage).catch(this.error);
    }

    if (typeof status['cur_current'] === 'number') {
      const cur_current = status['cur_current'] / 1000.0;
      this.setCapabilityValue('measure_current', cur_current).catch(this.error);
    }
  }

  async allOnOff(value) {
    const tuyaSwitches = this.getStore().tuya_switches;
    const commands = []

    for (const tuyaSwitch of tuyaSwitches) {
      commands.push({
        code: tuyaSwitch,
        value: !!value,
      })
    }

    await this.sendCommands(commands);
  }

  async onCapabilityOnOff(value, switch_number) {
    await this.sendCommand({
      code: `switch_${switch_number}`,
      value: !!value,
    });
  }
}

module.exports = TuyaOAuth2DeviceSocket;
