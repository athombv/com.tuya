import { TUYA_PERCENTAGE_SCALING } from '../../lib/TuyaOAuth2Constants';
import TuyaOAuth2Device from '../../lib/TuyaOAuth2Device';
import { TuyaCommand } from '../../types/TuyaApiTypes';
import { SettingsEvent, TuyaStatus } from '../../types/TuyaTypes';
import { DIMMER_SETTING_LABELS, HomeyDimmerSettings, TuyaDimmerSettings } from './TuyaDimmerConstants';
import * as TuyaOAuth2Util from '../../lib/TuyaOAuth2Util';

export default class TuyaOAuth2DeviceDimmer extends TuyaOAuth2Device {
  async onOAuth2Init(): Promise<void> {
    await super.onOAuth2Init();

    if (this.hasCapability('onoff')) {
      this.registerCapabilityListener('onoff', value => this.allOnOff(value));
    }

    if (this.hasCapability('dim')) {
      this.registerCapabilityListener('dim', value => this.allDim(value));
    }

    for (let switch_i = 1; switch_i <= 3; switch_i++) {
      if (this.hasCapability(`onoff.${switch_i}`)) {
        this.registerCapabilityListener(`onoff.${switch_i}`, value =>
          this.singleOnOff(value, `switch_led_${switch_i}`),
        );
      }

      if (this.hasCapability(`dim.${switch_i}`)) {
        this.registerCapabilityListener(`dim.${switch_i}`, value => this.singleDim(value, `bright_value_${switch_i}`));
      }
    }
  }

  async onTuyaStatus(status: TuyaStatus, changed: string[]): Promise<void> {
    await super.onTuyaStatus(status, changed);

    let anySwitchOn = false;

    for (let switch_i = 1; switch_i <= 3; switch_i++) {
      const tuyaSwitchCapability = `switch_led_${switch_i}`;
      const tuyaBrightnessCapability = `bright_value_${switch_i}`;
      const tuyaBrightnessMin = `brightness_min_${switch_i}`;
      const tuyaBrightnessMax = `brightness_max_${switch_i}`;
      const tuyaLampType = `led_type_${switch_i}`;

      const switchStatus = status[tuyaSwitchCapability];
      const brightnessStatus = status[tuyaBrightnessCapability];
      const brightnessMin = status[tuyaBrightnessMin];
      const brightnessMax = status[tuyaBrightnessMax];
      const lampType = status[tuyaLampType];

      if (typeof switchStatus === 'boolean') {
        anySwitchOn = anySwitchOn || switchStatus;

        if (changed.includes(tuyaSwitchCapability)) {
          const triggerCard = this.homey.flow.getDeviceTriggerCard(
            `dimmer_sub_switch_${switch_i}_turned_${switchStatus ? 'on' : 'off'}`,
          );
          triggerCard.trigger(this, {}, {}).catch(this.error);
        }

        await this.safeSetCapabilityValue(`onoff.${switch_i}`, switchStatus);
      }

      if (typeof brightnessMin === 'number') {
        await this.setSettings({
          [tuyaBrightnessMin]: brightnessMin / TUYA_PERCENTAGE_SCALING,
        });
      }

      if (typeof brightnessMax === 'number') {
        await this.setSettings({
          [tuyaBrightnessMax]: brightnessMax / TUYA_PERCENTAGE_SCALING,
        });
      }

      if (lampType !== undefined) {
        await this.setSettings({
          [tuyaLampType]: lampType,
        });
      }

      if (typeof brightnessStatus === 'number') {
        const scaleMin = this.getSetting(tuyaBrightnessMin) * TUYA_PERCENTAGE_SCALING;
        const scaleMax = this.getSetting(tuyaBrightnessMax) * TUYA_PERCENTAGE_SCALING;
        const scaledValue = (brightnessStatus - scaleMin) / (scaleMax - scaleMin);

        if (changed.includes(tuyaBrightnessCapability)) {
          const triggerCard = this.homey.flow.getDeviceTriggerCard(`dimmer_channel_${switch_i}_dim_changed`);
          triggerCard
            .trigger(this, {
              value: Math.round(scaledValue * 100) / 100, // Round to 2 decimals
            })
            .catch(this.error);
        }

        await this.safeSetCapabilityValue(`dim.${switch_i}`, scaledValue);
        await this.safeSetCapabilityValue(`dim`, scaledValue);
      }
    }

    await this.safeSetCapabilityValue('onoff', anySwitchOn);
  }

  async onSettings(event: SettingsEvent<HomeyDimmerSettings>): Promise<string | void> {
    return TuyaOAuth2Util.onSettings<TuyaDimmerSettings>(this, event, DIMMER_SETTING_LABELS);
  }

  async commandAll(codes: string[], value: unknown): Promise<void> {
    const commands: TuyaCommand[] = [];

    for (const code of codes) {
      commands.push({
        code: code,
        value: value,
      });
    }

    await this.sendCommands(commands);
  }

  async allOnOff(value: boolean): Promise<void> {
    const tuyaSwitches = this.getStore().tuya_switches;
    await this.commandAll(tuyaSwitches, value);
  }

  async singleOnOff(value: boolean, tuyaCapability: string): Promise<void> {
    await this.sendCommand({
      code: tuyaCapability,
      value: value,
    });
  }

  async allDim(value: number): Promise<void> {
    for (const tuyaDimmer of this.store.tuya_dimmers) {
      await this.singleDim(value, tuyaDimmer);
    }
  }

  async singleDim(value: number, tuyaCapability: string): Promise<void> {
    const subSwitch = tuyaCapability.at(tuyaCapability.length - 1);
    const scaleMin = this.getSetting(`brightness_min_${subSwitch}`) * TUYA_PERCENTAGE_SCALING;
    const scaleMax = this.getSetting(`brightness_max_${subSwitch}`) * TUYA_PERCENTAGE_SCALING;
    const scaledValue = Math.round(scaleMin + value * (scaleMax - scaleMin));

    await this.sendCommand({
      code: tuyaCapability,
      value: scaledValue,
    });
  }
}

module.exports = TuyaOAuth2DeviceDimmer;
