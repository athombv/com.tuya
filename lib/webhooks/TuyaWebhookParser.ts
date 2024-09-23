import type { SimpleClass } from 'homey';
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
export type EventEvent = {
  event: 'event';
  data: {
    etype: string;
    edata: string;
  };
};

export type TuyaWebhookData = OnlineEvent | OfflineEvent | StatusEvent | IotCoreStatusEvent | EventEvent;

export default class TuyaWebhookParser {
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
      case 'status':
        statusUpdate = convertStatusArrayToStatusObject(message.data.deviceStatus);
        break;
      case 'iot_core_status':
        statusUpdate = convertStatusArrayToStatusObject(message.data.properties);
        break;
      case 'event':
        statusUpdate = { event_message: message.data };
        break;
      default:
        throw new Error(`Unknown Webhook Event: ${JSON.stringify(message)}`);
    }

    const changedStatusCodes = Object.keys(statusUpdate);
    if (changedStatusCodes.length === 0) {
      this.logContext.log('Empty status update, ignoring');
      return;
    }

    this.logContext.log('Changed status codes', JSON.stringify(changedStatusCodes));
    for (const device of devices) {
      await device?.onStatus(message.event, statusUpdate, changedStatusCodes);
    }
  }
}
