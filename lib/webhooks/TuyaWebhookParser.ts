import type { SimpleClass } from 'homey';
import { TuyaStatusResponse } from '../../types/TuyaApiTypes';
import type { DeviceRegistration, TuyaIotCoreStatusUpdate, TuyaStatus, TuyaStatusUpdate } from '../../types/TuyaTypes';
import { convertStatusArrayToStatusObject } from '../TuyaOAuth2Util';

type OnlineEvent = { event: 'online' };
type OfflineEvent = { event: 'offline' };
type StatusEvent = {
  event: 'status';
  data: {
    dataId?: string;
    deviceStatus?: Array<TuyaStatusUpdate<unknown>>;
  };
};
type IotCoreStatusEvent = {
  event: 'iot_core_status';
  data: {
    dataId: string;
    properties?: Array<TuyaIotCoreStatusUpdate<unknown>>;
  };
};

type TuyaWebhookData = OnlineEvent | OfflineEvent | StatusEvent | IotCoreStatusEvent;

export default class TuyaWebhookParser {
  private dataHistory: string[] = [];
  private dataHistoryCodes: Record<string, string[]> = {};
  private readonly logContext;

  constructor(logContext: SimpleClass) {
    this.logContext = logContext;
  }

  public async handle(devices: Array<DeviceRegistration | null>, message: TuyaWebhookData): Promise<void> {
    let statusUpdate: TuyaStatus;
    switch (message.event) {
      case 'online':
        statusUpdate = { online: true };
        break;
      case 'offline':
        statusUpdate = { online: false };
        break;
      case 'status': // Legacy status update
        statusUpdate = this.filterDuplicateData(message.data.dataId, message.data.deviceStatus);

        break;
      case 'iot_core_status':
        statusUpdate = this.filterDuplicateData(message.data.dataId, message.data.properties);

        break;
      default:
        throw new Error(`Unknown Webhook Event: ${message}`);
    }

    const changedStatusCodes = Object.keys(statusUpdate);
    if (changedStatusCodes.length === 0) {
      this.logContext.log('Empty status update, ignoring');
      return;
    }

    this.logContext.log('Changed status codes', changedStatusCodes);
    for (const device of devices) {
      await device?.onStatus(statusUpdate, changedStatusCodes);
    }
  }

  private filterDuplicateData(dataId?: string, statuses?: TuyaStatusResponse): TuyaStatus {
    const statusUpdate = convertStatusArrayToStatusObject(statuses);

    if (!dataId) {
      return statusUpdate;
    }

    // Check whether we already got this data point
    if (!this.dataHistory.includes(dataId)) {
      // We keep a history of 50 items
      if (this.dataHistory.length >= 50) {
        const oldDataId = this.dataHistory.shift();
        if (oldDataId) {
          delete this.dataHistoryCodes[oldDataId];
        }
      }

      // Add the data registration
      this.dataHistory.push(dataId);
      this.dataHistoryCodes[dataId] = [];
    }

    for (const key of Object.keys(statusUpdate)) {
      if (this.dataHistoryCodes[dataId]?.includes(key)) {
        // Already received, so skip it
        delete statusUpdate[key];
        continue;
      }

      this.dataHistoryCodes[dataId]?.push(key);
    }

    return statusUpdate;
  }
}
