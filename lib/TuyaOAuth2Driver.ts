import { OAuth2DeviceResult, OAuth2Driver } from 'homey-oauth2app';
import {
  type TuyaDeviceDataPointResponse,
  TuyaDeviceResponse,
  TuyaDeviceSpecificationResponse,
} from '../types/TuyaApiTypes';
import type { StandardFlowArgs, Translation } from '../types/TuyaTypes';
import TuyaOAuth2Client from './TuyaOAuth2Client';
import { sendSetting } from './TuyaOAuth2Util';

import * as TuyaOAuth2Util from './TuyaOAuth2Util';

export type ListDeviceProperties = {
  store: {
    [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  };
  settings: {
    [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  };
  capabilities: string[];
  capabilitiesOptions: {
    [key: string]: {
      [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    };
  };
};

export default class TuyaOAuth2Driver extends OAuth2Driver<TuyaOAuth2Client> {
  TUYA_DEVICE_CATEGORIES: ReadonlyArray<string> = [];

  async onPairListDevices({ oAuth2Client }: { oAuth2Client: TuyaOAuth2Client }): Promise<OAuth2DeviceResult[]> {
    const devices = await oAuth2Client.getDevices();
    const filteredDevices = devices.filter(device => {
      return !oAuth2Client.isRegistered(device.product_id, device.id) && this.onTuyaPairListDeviceFilter(device);
    });
    const listDevices: OAuth2DeviceResult[] = [];

    this.log('Listing devices to pair:');

    for (const device of filteredDevices) {
      this.log('Device:', JSON.stringify(TuyaOAuth2Util.redactFields(device)));
      const deviceSpecs =
        (await oAuth2Client
          .getSpecification(device.id)
          .catch(e => this.log('Device specification retrieval failed', e))) ?? undefined;
      const dataPoints =
        (await oAuth2Client.queryDataPoints(device.id).catch(e => this.log('Device properties retrieval failed', e))) ??
        undefined;

      // GitHub #178: Some device do not have the status property at all.
      // Make sure to populate it with an empty array instead.
      if (!Array.isArray(device.status)) {
        device.status = [];
      }

      const deviceProperties = this.onTuyaPairListDeviceProperties({ ...device }, deviceSpecs, dataPoints);

      listDevices.push({
        ...deviceProperties,
        name: device.name,
        data: {
          deviceId: device.id,
          productId: device.product_id,
        },
      });
    }
    return listDevices;
  }

  onTuyaPairListDeviceFilter(device: TuyaDeviceResponse): boolean {
    return this.TUYA_DEVICE_CATEGORIES.includes(device.category);
  }

  onTuyaPairListDeviceProperties(
    device: TuyaDeviceResponse, // eslint-disable-line @typescript-eslint/no-unused-vars
    specifications?: TuyaDeviceSpecificationResponse, // eslint-disable-line @typescript-eslint/no-unused-vars
    dataPoints?: TuyaDeviceDataPointResponse,
  ): ListDeviceProperties {
    const combinedSpecification = {
      device: TuyaOAuth2Util.redactFields(device),
      specifications: specifications ?? '<not available>',
      data_points: dataPoints?.properties ?? '<not available>',
    };

    return {
      capabilities: [],
      store: {
        tuya_capabilities: [],
        tuya_category: device.category,
      },
      capabilitiesOptions: {},
      settings: {
        deviceSpecification: JSON.stringify(combinedSpecification, undefined, 2),
      },
    };
  }

  protected addSettingFlowHandler<K extends string, L extends Record<K, Translation>>(setting: K, labels: L): void {
    this.homey.flow
      .getActionCard(`${this.id}_${setting}`)
      .registerRunListener(
        async (args: StandardFlowArgs) => await sendSetting(args.device, setting, args.value, labels),
      );
  }
}

module.exports = TuyaOAuth2Driver;
