import { OAuth2Device } from 'homey-oauth2app';
import type { TuyaCommand, TuyaDeviceDataPointResponse, TuyaStatusResponse, TuyaWebRTC } from '../types/TuyaApiTypes';

import type { TuyaStatus, TuyaStatusSource } from '../types/TuyaTypes';
import TuyaOAuth2Client from './TuyaOAuth2Client';
import * as TuyaOAuth2Util from './TuyaOAuth2Util';
import * as GeneralMigrations from './migrations/GeneralMigrations';

export default class TuyaOAuth2Device extends OAuth2Device<TuyaOAuth2Client> {
  __status: TuyaStatus;
  __syncInterval?: NodeJS.Timeout;

  /**
   * Ensure migrations are finished before the device is used.
   * This barrier should only be lowered after all initialization is done.
   */
  initBarrier = true;

  async onInit(): Promise<void> {
    await super.onInit();
    await this.performMigrations();
    this.initBarrier = false;
    this.log('Finished initialization of', this.getName());
  }

  async performMigrations(): Promise<void> {
    await GeneralMigrations.performMigrations(this);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(...props: any) {
    super(...props);

    this.__status = {};
    this.__sync = this.__sync.bind(this);
    this.onTuyaStatus = this.onTuyaStatus.bind(this);
  }

  static SYNC_INTERVAL = null; // Set to number n to sync every n ms

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get data(): any {
    return super.getData();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        onStatus: this.__onTuyaStatus.bind(this),
      },
      isOtherDevice,
    );

    const statusSourceUpdateCodes = this.getStoreValue('status_source_update_codes');
    if (Array.isArray(statusSourceUpdateCodes)) {
      this.log('Restoring status source update codes: ', JSON.stringify(statusSourceUpdateCodes));
      statusSourceUpdateCodes.forEach(c => this.tuyaStatusSourceUpdateCodes.add(c));
    }

    if (typeof TuyaOAuth2Device.SYNC_INTERVAL === 'number') {
      this.__syncInterval = this.homey.setInterval(this.__sync, TuyaOAuth2Device.SYNC_INTERVAL);
    }
    await this.__sync();
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
  private tuyaStatusSourceUpdateCodes: Set<string> = new Set();

  private async __onTuyaStatus(
    source: TuyaStatusSource,
    status: TuyaStatus,
    changedStatusCodes: string[] = [],
  ): Promise<void> {
    // Wait at least 100ms for initialization before trying to pass the barrier again
    while (this.initBarrier) {
      await new Promise(resolve => this.homey.setTimeout(resolve, 100));
    }

    // Filter duplicated data
    if (source === 'status') {
      changedStatusCodes.forEach(c => {
        if (this.tuyaStatusSourceUpdateCodes.has(c)) {
          return;
        }

        this.log('Add status source update code', c);
        this.tuyaStatusSourceUpdateCodes.add(c);
        this.setStoreValue('status_source_update_codes', Array.from(this.tuyaStatusSourceUpdateCodes));
      });
    }

    if (source === 'iot_core_status') {
      // GH-239: As we have two data sources, certain data point updates can come in twice.
      // When a code has been reported with the status event, we should no longer listen to that code
      // when coming in from the iot_core_status event.
      for (const changedStatusCode of changedStatusCodes) {
        if (!this.tuyaStatusSourceUpdateCodes.has(changedStatusCode)) {
          continue;
        }

        this.log('Ignoring iot_core_status code change', changedStatusCode);
        delete status[changedStatusCode];
      }

      // Recompute changed status codes
      changedStatusCodes = Object.keys(status);
    }

    this.__status = {
      ...this.__status,
      ...status,
    };

    this.log('onTuyaStatus', source, JSON.stringify(this.__status));

    // Trigger the custom code cards
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

    if (status.online === true) {
      this.setAvailable().catch(this.error);
    }

    if (status.online === false) {
      this.setUnavailable(this.homey.__('device_offline')).catch(this.error);

      // Prevent further updates that would mark the device as available
      return;
    }

    await this.onTuyaStatus(this.__status, changedStatusCodes);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async onTuyaStatus(_status: TuyaStatus, _changedStatusCodes: string[]): Promise<void> {
    // Overload Me
  }

  private async __sync(): Promise<void> {
    Promise.resolve()
      .then(async () => {
        this.log('Syncing...');
        const { deviceId } = this.data;
        const device = await this.oAuth2Client.getDevice({ deviceId });

        const status = TuyaOAuth2Util.convertStatusArrayToStatusObject(device.status);
        await this.__onTuyaStatus('sync', {
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

  async queryDataPoints(): Promise<TuyaDeviceDataPointResponse> {
    const { deviceId } = this.data;
    return this.oAuth2Client.queryDataPoints(deviceId);
  }

  async setDataPoint(dataPointId: string, value: unknown): Promise<void> {
    const { deviceId } = this.data;
    return this.oAuth2Client.setDataPoint(deviceId, dataPointId, value);
  }

  async getWebRTC(): Promise<TuyaWebRTC> {
    const { deviceId } = this.data;
    return this.oAuth2Client.getWebRTCConfiguration({ deviceId });
  }

  async getStreamingLink(type: 'RTSP' | 'HLS'): Promise<{ url: string }> {
    const { deviceId } = this.data;
    return this.oAuth2Client.getStreamingLink(deviceId, type);
  }

  async safeSetCapabilityValue(capabilityId: string | undefined | null, value: unknown): Promise<void> {
    if (!capabilityId || !this.hasCapability(capabilityId)) {
      return;
    }

    await this.setCapabilityValue(capabilityId, value).catch(this.error);
  }

  async safeSetSettingValue(settingKey: string, value: unknown): Promise<void> {
    await this.setSettings({
      [settingKey]: value,
    }).catch(this.error);
  }

  log(...args: unknown[]): void {
    super.log(`[tc:${this.getStoreValue('tuya_category')}]`, ...args);
  }

  error(...args: unknown[]): void {
    super.error(`[tc:${this.getStoreValue('tuya_category')}]`, ...args);
  }
}

module.exports = TuyaOAuth2Device;
