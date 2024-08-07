'use strict';

const TuyaOAuth2Device = require('./TuyaOAuth2Device');
const TuyaOAuth2Util = require('./TuyaOAuth2Util');
const { SOCKET_SETTING_LABELS} = require('./TuyaSocketConstants');

/**
 * Device Class for Tuya Sockets
 */
class TuyaOAuth2DeviceSocket extends TuyaOAuth2Device {

  turnedOnFlowCard;
  turnedOffFlowCard;

  async onInit() {
    await super.onInit();

    this.turnedOnFlowCard = this.homey.flow.getDeviceTriggerCard('socket_sub_switch_turned_on');
    this.turnedOffFlowCard = this.homey.flow.getDeviceTriggerCard('socket_sub_switch_turned_off');
  }

  async onOAuth2Init() {
    await super.onOAuth2Init();

    // onoff
    if (this.hasCapability('onoff')) {
      this.registerCapabilityListener('onoff', (value) => this.allOnOff(value));
    }

    for (let switch_i = 1; switch_i <= 6; switch_i++) {
      if (this.hasCapability(`onoff.switch_${switch_i}`)) {
        this.registerCapabilityListener(`onoff.switch_${switch_i}`, (value) => this.switchOnOff(value, `switch_${switch_i}`));
      }
    }
  }

  async safeSetCapabilityValue(capabilityId, value) {
    if (this.hasCapability(capabilityId)) {
      await this.setCapabilityValue(capabilityId, value);
    }
  }

  async onTuyaStatus(status, changedStatusCodes) {
    await super.onTuyaStatus(status);

    // onoff
    let anySwitchOn = false;

    for (let switch_i = 1; switch_i <= 6; switch_i++) {
      const tuyaCapability = `switch_${switch_i}`;
      const switchStatus = status[tuyaCapability];
      const switchCapability = `onoff.switch_${switch_i}`;

      if (typeof switchStatus === 'boolean') {
        anySwitchOn = anySwitchOn || switchStatus;

        // Trigger the appropriate flow only when the status actually changed
        if (changedStatusCodes.includes(tuyaCapability)) {
          const triggerCard = switchStatus ? this.turnedOnFlowCard : this.turnedOffFlowCard;
          triggerCard.trigger(this, {}, {
            tuyaCapability: tuyaCapability
          }).catch(this.error);
        }

        this.safeSetCapabilityValue(switchCapability, switchStatus).catch(this.error);
      }
    }

    if (typeof status['switch'] === 'boolean') {
      anySwitchOn = anySwitchOn || status['switch'];
    }

    this.safeSetCapabilityValue('onoff', anySwitchOn).catch(this.error);

    if (typeof status['cur_power'] === 'number') {
      const powerScaling = 10 ** parseFloat(this.getSetting('power_scaling') ?? "0");
      const cur_power = status['cur_power'] / powerScaling;
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

    for (const setting of ["child_lock", "relay_status"]) {
      const settingValue = status[setting];
      if (settingValue !== undefined) {
        await this.setSettings({
          [setting]: settingValue,
        })
      }
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

  async switchOnOff(value, tuya_switch) {
    await this.sendCommand({
      code: tuya_switch,
      value: !!value,
    });
  }

  async onSettings(event) {
    return await TuyaOAuth2Util.onSettings(this, event, SOCKET_SETTING_LABELS);
  }
}

module.exports = TuyaOAuth2DeviceSocket;
