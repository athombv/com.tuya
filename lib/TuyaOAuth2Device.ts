import { OAuth2Device } from 'homey-oauth2app';
import { TuyaCommand, TuyaStatusResponse, TuyaWebRTC } from '../types/TuyaApiTypes';

import { TuyaStatus, TuyaStatusUpdate } from '../types/TuyaTypes';
import TuyaOAuth2Client from './TuyaOAuth2Client';
import * as TuyaOAuth2Util from './TuyaOAuth2Util';

export default class TuyaOAuth2Device extends OAuth2Device<TuyaOAuth2Client> {
  __status: TuyaStatus;
  __syncInterval?: NodeJS.Timeout;

  constructor(...props: any) {
    super(...props);

    this.__status = {};
    this.__sync = this.__sync.bind(this);
    this.onTuyaStatus = this.onTuyaStatus.bind(this);
  }

  static SYNC_INTERVAL = null; // Set to number n to sync every n ms

  get data(): any {
    return super.getData();
  }

  get store(): any {
    return super.getStore();
  }

  hasTuyaCapability(tuyaCapabilityId: string): boolean {
    return this.store?.tuya_capabilities?.includes(tuyaCapabilityId) ?? false;
  }

  /*
   * OAuth2
   */
  async onOAuth2Init(): Promise<void> {
    await super.onOAuth2Init();

    const isOtherDevice = this.driver.id === 'other';

    this.oAuth2Client.registerDevice(
      {
        ...this.data,
        onStatus: async (statuses: TuyaStatusUpdate<unknown>[]) => {
          const changedStatusCodes = statuses.map((status: TuyaStatusUpdate<unknown>) => status.code);

          console.log('changedStatusCodes', changedStatusCodes);
          const status = TuyaOAuth2Util.convertStatusArrayToStatusObject(statuses);
          await this.__onTuyaStatus(status, changedStatusCodes);
        },
        onOnline: async () => {
          await this.__onTuyaStatus({
            online: true,
          });
        },
        onOffline: async () => {
          await this.__onTuyaStatus({
            online: false,
          });
        },
      },
      isOtherDevice,
    );

    if (typeof TuyaOAuth2Device.SYNC_INTERVAL === 'number') {
      this.__syncInterval = this.homey.setInterval(this.__sync, TuyaOAuth2Device.SYNC_INTERVAL);
    }
    await this.__sync();

    this.log(`Inited: ${this.getName()}`);
  }

  async onOAuth2Uninit(): Promise<void> {
    await super.onOAuth2Uninit();

    if (this.__syncInterval) {
      this.homey.clearInterval(this.__syncInterval);
    }

    if (this.oAuth2Client) {
      const isOtherDevice = this.driver.id === 'other';

      this.oAuth2Client.unregisterDevice({ ...this.data }, isOtherDevice);
    }
  }

  /*
   * Tuya
   */
  async __onTuyaStatus(status: TuyaStatus, changedStatusCodes: string[] = []): Promise<void> {
    this.__status = {
      ...this.__status,
      ...status,
    };

    for (const changedStatusCode of changedStatusCodes) {
      let changedStatusValue = status[changedStatusCode];

      let triggerCardId;
      if (typeof changedStatusValue === 'boolean') {
        triggerCardId = 'receive_status_boolean';
      } else if (typeof changedStatusValue === 'number') {
        triggerCardId = 'receive_status_number';
      } else if (typeof changedStatusValue === 'string') {
        const hasJsonStructure = TuyaOAuth2Util.hasJsonStructure(changedStatusValue);
        if (hasJsonStructure) {
          triggerCardId = 'receive_status_json';
        } else {
          triggerCardId = 'receive_status_string';
        }
      } else if (typeof changedStatusValue === 'object') {
        changedStatusValue = JSON.stringify(changedStatusValue);
        triggerCardId = 'receive_status_json';
      }

      await this.homey.flow
        .getDeviceTriggerCard(triggerCardId)
        .trigger(
          this,
          {
            value: changedStatusValue,
          },
          {
            code: changedStatusCode,
          },
        )
        .catch(this.error);
    }

    await this.onTuyaStatus(this.__status, changedStatusCodes);
  }

  async onTuyaStatus(status: TuyaStatus, changedStatusCodes: string[]): Promise<void> {
    this.log('onTuyaStatus', JSON.stringify(status));

    if (status.online === true) {
      this.setAvailable().catch(this.error);
    }

    if (status.online === false) {
      this.setUnavailable(this.homey.__('device_offline')).catch(this.error);
    }

    // Overload Me
  }

  async __sync(): Promise<void> {
    Promise.resolve()
      .then(async () => {
        this.log('Syncing...');
        const { deviceId } = this.data;
        const device = await this.oAuth2Client.getDevice({ deviceId });

        const status = TuyaOAuth2Util.convertStatusArrayToStatusObject(device.status);
        await this.__onTuyaStatus({
          ...status,
          online: device.online,
        });
      })
      .catch(err => {
        this.error(`Error Syncing: ${err.message}`);
        this.setUnavailable(err).catch(this.error);
      });
  }

  async sendCommands(commands: TuyaCommand[] = []): Promise<void> {
    await this.oAuth2Client.sendCommands({
      commands,
      deviceId: this.data.deviceId,
    });
  }

  async sendCommand({ code, value }: TuyaCommand): Promise<void> {
    await this.sendCommands([
      {
        code,
        value,
      },
    ]);
  }

  async getStatus(): Promise<TuyaStatusResponse> {
    const { deviceId } = this.data;
    return this.oAuth2Client.getDeviceStatus({
      deviceId,
    });
  }

  async getWebRTC(): Promise<TuyaWebRTC> {
    const { deviceId } = this.data;
    return this.oAuth2Client.getWebRTCConfiguration({ deviceId });
  }

  async getStreamingLink(type: 'RTSP' | 'HLS'): Promise<{ url: string }> {
    const { deviceId } = this.data;
    return this.oAuth2Client.getStreamingLink(deviceId, type);
  }
}

module.exports = TuyaOAuth2Device;
