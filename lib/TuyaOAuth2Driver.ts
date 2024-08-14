import { OAuth2DeviceResult, OAuth2Driver } from 'homey-oauth2app';
import { TuyaDeviceResponse, TuyaDeviceSpecificationResponse } from '../types/TuyaApiTypes';
import TuyaOAuth2Client from './TuyaOAuth2Client';

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
      this.log('Device:', JSON.stringify(TuyaOAuth2Util.redactFields(device)));
      return this.onTuyaPairListDeviceFilter(device);
    });
    const listDevices: OAuth2DeviceResult[] = [];
    for (const device of filteredDevices) {
      const deviceSpecs =
        (await oAuth2Client
          .getSpecification({ deviceId: device.id })
          .catch(e => this.log('Device specification retrieval failed', e))) ?? undefined;

      const deviceProperties = this.onTuyaPairListDeviceProperties({ ...device }, deviceSpecs);
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
  ): ListDeviceProperties {
    return {
      capabilities: [],
      store: {
        tuya_capabilities: [],
      },
      capabilitiesOptions: {},
      settings: {},
    };
  }
}

module.exports = TuyaOAuth2Driver;
