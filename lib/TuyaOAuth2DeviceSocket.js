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
      this.registerCapabilityListener('onoff', (value) => this.onCapabilityOnOff(value, 1));
    }

    for (let switch_i = 2; switch_i <= 6; switch_i++) {
      if (this.hasCapability(`onoff.switch_${switch_i}`)) {
        this.registerCapabilityListener(`onoff.switch_${switch_i}`, (value) => this.onCapabilityOnOff(value, switch_i));
      }
    }
  }

  async onTuyaStatus(status) {
    await super.onTuyaStatus(status);

    // onoff
    if (typeof status['switch_1'] === 'boolean') {
      this.setCapabilityValue('onoff', status['switch_1']).catch(this.error);
    }

    for (let switch_i = 2; switch_i <= 6; switch_i++) {
      const switchStatus = status[`switch_${switch_i}`];
      if (typeof switchStatus === 'boolean') {
        this.setCapabilityValue(`onoff.switch_${switch_i}`, switchStatus).catch(this.error);
      }
    }

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

  async onCapabilityOnOff(value, switch_number) {
    await this.sendCommand({
      code: `switch_${switch_number}`,
      value: !!value,
    });
  }
}

module.exports = TuyaOAuth2DeviceSocket;
