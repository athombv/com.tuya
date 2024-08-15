import { Device, FlowCardTriggerDevice } from 'homey';

import TuyaOAuth2Device from '../../lib/TuyaOAuth2Device';
import * as TuyaOAuth2Util from '../../lib/TuyaOAuth2Util';
import { SettingsEvent, TuyaStatus } from '../../types/TuyaTypes';
import { SOCKET_SETTING_LABELS, HomeySocketSettings, TuyaSocketSettings } from './TuyaSocketConstants';

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

  async safeSetCapabilityValue(capabilityId: string, value: unknown): Promise<void> {
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

    if (status['child_lock'] !== undefined) {
      await this.setSettings({
        child_lock: status['child_lock'],
      });
    }

    if (status['relay_status'] !== undefined) {
      const relayStatus = status['relay_status'] as TuyaSocketSettings['relay_status'];
      let mappedRelayStatus: HomeySocketSettings['relay_status'];

      if (this.getStoreValue('tuya_category') === 'tdq') {
        // Remap the relay_status
        switch (relayStatus) {
          case '0':
            mappedRelayStatus = 'power_on';
            break;
          case '1':
            mappedRelayStatus = 'power_off';
            break;
          default:
            mappedRelayStatus = 'last';
            break;
        }
      } else {
        mappedRelayStatus = relayStatus as HomeySocketSettings['relay_status'];
      }

      await this.setSettings({
        relay_status: mappedRelayStatus,
      });
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

  async onSettings(event: SettingsEvent<HomeySocketSettings>): Promise<string | void> {
    // Deep copy, since event is read-only
    const mappedEvent: SettingsEvent<TuyaSocketSettings> = { ...event };

    if (this.getStoreValue('tuya_category') === 'tdq') {
      const mappedNewSettings = { ...mappedEvent.newSettings };

      // Remap the relay_status
      switch (mappedNewSettings['relay_status']) {
        case 'power_on':
          mappedNewSettings['relay_status'] = '0';
          break;
        case 'power_off':
          mappedNewSettings['relay_status'] = '1';
          break;
        default:
          mappedNewSettings['relay_status'] = '2';
          break;
      }

      mappedEvent.newSettings = mappedNewSettings;
    }

    return await TuyaOAuth2Util.onSettings(this, mappedEvent, SOCKET_SETTING_LABELS);
  }
}

module.exports = TuyaOAuth2DeviceSocket;
