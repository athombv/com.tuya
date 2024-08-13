'use strict';

import {OAuth2DeviceResult, OAuth2Driver} from 'homey-oauth2app';
import TuyaOAuth2Client from "./TuyaOAuth2Client";
import {TuyaDeviceResponse, TuyaDeviceSpecificationResponse} from "../types/TuyaApiTypes";

const TuyaOAuth2Util = require('./TuyaOAuth2Util');

export type ListDeviceProperties = {
  store: {
    [key: string]: any
  },
  settings: {
    [key: string]: any
  },
  capabilities: string[],
  capabilitiesOptions: {
    [key: string]: {
      [key: string]: any
    }
  },
}

export default class TuyaOAuth2Driver extends OAuth2Driver<TuyaOAuth2Client> {

  TUYA_DEVICE_CATEGORIES: string[] = [];

  async onPairListDevices({ oAuth2Client }: { oAuth2Client: TuyaOAuth2Client }) {
    const devices = await oAuth2Client.getDevices();
    const filteredDevices = devices
      .filter(device => {
        this.log('Device:', JSON.stringify(TuyaOAuth2Util.redactFields(device)));
        return this.onTuyaPairListDeviceFilter(device);
      });
    const listDevices: OAuth2DeviceResult[] = [];
    for (const device of filteredDevices) {
      const deviceSpecs = await oAuth2Client.getSpecification({deviceId: device.id})
          .catch(e => this.log('Device specification retrieval failed', e)) ?? undefined;

      const deviceProperties = this.onTuyaPairListDeviceProperties({...device}, deviceSpecs);
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

  onTuyaPairListDeviceFilter(device: TuyaDeviceResponse) {
    return this.TUYA_DEVICE_CATEGORIES.includes(device.category);
  }

  onTuyaPairListDeviceProperties(device: TuyaDeviceResponse, specifications?: TuyaDeviceSpecificationResponse): ListDeviceProperties {
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
