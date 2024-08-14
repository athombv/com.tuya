import { Device, FlowCardTriggerDevice } from 'homey';
import { SettingsEvent, TuyaStatus } from '../../types/TuyaTypes';

import TuyaOAuth2Device from '../../lib/TuyaOAuth2Device';
import * as TuyaOAuth2Util from '../../lib/TuyaOAuth2Util';
import { SOCKET_SETTING_LABELS } from './TuyaSocketConstants';

/**
 * Device Class for Tuya Sockets
 */
export default class TuyaOAuth2DeviceSocket extends TuyaOAuth2Device {
  turnedOnFlowCard!: FlowCardTriggerDevice;
  turnedOffFlowCard!: FlowCardTriggerDevice;

  async onInit(): Promise<void> {
    await super.onInit();

    this.turnedOnFlowCard = this.homey.flow.getDeviceTriggerCard('socket_sub_switch_turned_on');
    this.turnedOffFlowCard = this.homey.flow.getDeviceTriggerCard('socket_sub_switch_turned_off');
  }

  async onOAuth2Init(): Promise<void> {
    await super.onOAuth2Init();

    // onoff
    if (this.hasCapability('onoff')) {
      this.registerCapabilityListener('onoff', value => this.allOnOff(value));
    }

    for (let switch_i = 1; switch_i <= 6; switch_i++) {
      if (this.hasCapability(`onoff.switch_${switch_i}`)) {
        this.registerCapabilityListener(`onoff.switch_${switch_i}`, value =>
          this.switchOnOff(value, `switch_${switch_i}`),
        );
      }
    }
  }

  async safeSetCapabilityValue(capabilityId: string, value: any): Promise<void> {
    if (this.hasCapability(capabilityId)) {
      await this.setCapabilityValue(capabilityId, value);
    }
  }

  async onTuyaStatus(status: TuyaStatus, changedStatusCodes: string[]): Promise<void> {
    await super.onTuyaStatus(status, changedStatusCodes);

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
          triggerCard
            .trigger(
              this as Device,
              {},
              {
                tuyaCapability: tuyaCapability,
              },
            )
            .catch(this.error);
        }

        this.safeSetCapabilityValue(switchCapability, switchStatus).catch(this.error);
      }
    }

    if (typeof status['switch'] === 'boolean') {
      anySwitchOn = anySwitchOn || status['switch'];
    }

    this.safeSetCapabilityValue('onoff', anySwitchOn).catch(this.error);

    if (typeof status['cur_power'] === 'number') {
      const powerScaling = 10 ** parseFloat(this.getSetting('power_scaling') ?? '0');
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

    for (const setting of ['child_lock', 'relay_status']) {
      const settingValue = status[setting];
      if (settingValue !== undefined) {
        await this.setSettings({
          [setting]: settingValue,
        });
      }
    }
  }

  async allOnOff(value: boolean): Promise<void> {
    const tuyaSwitches = this.getStore().tuya_switches;
    const commands = [];

    for (const tuyaSwitch of tuyaSwitches) {
      commands.push({
        code: tuyaSwitch,
        value: value,
      });
    }

    await this.sendCommands(commands);
  }

  async switchOnOff(value: boolean, tuya_switch: string): Promise<void> {
    await this.sendCommand({
      code: tuya_switch,
      value: value,
    });
  }

  // TODO define settings
  async onSettings(event: SettingsEvent<any>): Promise<string | void> {
    return await TuyaOAuth2Util.onSettings(this, event, SOCKET_SETTING_LABELS);
  }
}

module.exports = TuyaOAuth2DeviceSocket;
