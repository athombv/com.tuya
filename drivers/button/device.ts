import TuyaOAuth2Device from '../../lib/TuyaOAuth2Device';
import { TuyaStatus } from '../../types/TuyaTypes';

module.exports = class TuyaOAuth2DeviceButton extends TuyaOAuth2Device {
  async onOAuth2Init(): Promise<void> {
    await super.onOAuth2Init();
  }

  async onTuyaStatus(status: TuyaStatus, changed: string[]): Promise<void> {
    await super.onTuyaStatus(status, changed);

    for (const tuyaCapability in status) {
      const value = status[tuyaCapability];

      if (tuyaCapability.startsWith('switch_mode') && changed.includes(tuyaCapability)) {
        await this.homey.flow
          .getDeviceTriggerCard(`button_sub_switch_${value}ed`)
          .trigger(
            this,
            {},
            {
              switch: { id: tuyaCapability },
            },
          )
          .catch(this.error);
      }

      if (tuyaCapability === 'knob_switch_mode_1') {
        await this.homey.flow.getDeviceTriggerCard('button_knob_turned').trigger(this, {}, { value }).catch(this.error);
      }

      if (tuyaCapability === 'battery_percentage') {
        await this.safeSetCapabilityValue('measure_battery', value);
      }
    }
  }
};
