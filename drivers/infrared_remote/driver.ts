import { OAuth2DeviceResult, OAuth2Driver } from 'homey-oauth2app';
import TuyaOAuth2Client from '../../lib/TuyaOAuth2Client';
import { TuyaDeviceResponse, TuyaIrRemoteKeysResponse, TuyaIrRemoteResponse } from '../../types/TuyaApiTypes';
import * as TuyaOAuth2Util from '../../lib/TuyaOAuth2Util';
import { StandardDeviceFlowArgs } from '../../types/TuyaTypes';
import type TuyaOAuth2DeviceIrController from './device';
import { ArgumentAutocompleteResults } from 'homey/lib/FlowCard';

type PairingRemote = TuyaIrRemoteResponse & {
  controllerId: string;
};

type ButtonArgs = {
  button:
    | {
        name: string;
        id: number;
        airco: false;
      }
    | {
        name: string;
        code: string;
        value: number;
        airco: true;
      };
};

function processKeyName(string: string): string {
  const cleanName = string.toLowerCase().replace('_', ' ');
  return capitalize(cleanName);
}

function capitalize(string: string): string {
  const words = string.split(' ').map(word => {
    return word.charAt(0).toUpperCase() + word.slice(1);
  });
  return words.join(' ');
}

function generateKeys(remoteKeys: TuyaIrRemoteKeysResponse): ArgumentAutocompleteResults {
  const results: ArgumentAutocompleteResults = [];

  const airco = remoteKeys.category_id === 5;

  for (const key of remoteKeys.key_list) {
    // Skip the standard keys in air conditioner remotes, as they are placeholders
    if (!(airco && key.standard_key)) {
      results.push({
        name: processKeyName(key.key_name),
        id: key.key_id,
        airco: false,
      });
    }
  }

  if (airco) {
    results.push(
      {
        name: 'Power On',
        code: 'power',
        value: 1,
        airco: true,
      },
      {
        name: 'Power Off',
        code: 'power',
        value: 0,
        airco: true,
      },
    );

    const modes: Record<number, string> = {};
    const temperatures: Set<number> = new Set();
    const fanSpeeds: Record<number, string> = {};

    for (const range of remoteKeys.key_range) {
      modes[range.mode] = range.mode_name;

      for (const temperature of range.temp_list) {
        temperatures.add(temperature.temp);

        for (const fanSpeed of temperature.fan_list) {
          fanSpeeds[fanSpeed.fan] = fanSpeed.fan_name;
        }
      }
    }

    for (const mode in modes) {
      results.push({
        name: processKeyName(modes[mode]),
        code: 'mode',
        value: mode,
        airco: true,
      });
    }

    for (const fanSpeed in fanSpeeds) {
      results.push({
        name: processKeyName(fanSpeeds[fanSpeed]),
        code: 'wind',
        value: fanSpeed,
        airco: true,
      });
    }

    const sortedTemperatures: number[] = Array.from(temperatures).sort();

    for (const temperature of sortedTemperatures) {
      results.push({
        name: `Temperature ${temperature}`,
        code: 'temp',
        value: temperature,
        airco: true,
      });
    }
  }

  return results;
}

module.exports = class TuyaOAuth2DriverIrController extends OAuth2Driver<TuyaOAuth2Client> {
  async onInit(): Promise<void> {
    await super.onInit();

    const buttonAutocompleteListener = (query: string, args: StandardDeviceFlowArgs): ArgumentAutocompleteResults => {
      const results = (args.device.getStoreValue('tuya_remote_keys') as ArgumentAutocompleteResults).filter(result => {
        const searchString = result.name.toLowerCase();
        const queryWords = query.toLowerCase().split(' ');
        // Return false if any query word is not included
        for (const queryWord of queryWords) {
          if (!searchString.includes(queryWord)) {
            return false;
          }
        }
        return true;
      });

      return results;
    };

    this.homey.flow
      .getActionCard('infrared_remote_press')
      .registerArgumentAutocompleteListener('button', (query: string, args: StandardDeviceFlowArgs) =>
        buttonAutocompleteListener(query, args),
      )
      .registerRunListener(async (args: StandardDeviceFlowArgs & ButtonArgs) => {
        const button = args.button;
        if (button.airco) {
          await (args.device as TuyaOAuth2DeviceIrController).sendAircoCommand(button.code, button.value);
        } else {
          await (args.device as TuyaOAuth2DeviceIrController).sendKeyCommand(button.id);
        }
      });

    for (const button of ['mute', 'power', 'on', 'off']) {
      this.homey.flow
        .getActionCard(`infrared_remote_${button}_button`)
        .registerRunListener(async (args: StandardDeviceFlowArgs) => {
          await (args.device as TuyaOAuth2DeviceIrController).triggerCapabilityListener(`${button}_button`, true);
        });
    }
  }

  async onPairListDevices({ oAuth2Client }: { oAuth2Client: TuyaOAuth2Client }): Promise<OAuth2DeviceResult[]> {
    const devices = await oAuth2Client.getDevices();

    const deviceIndex: Record<string, TuyaDeviceResponse> = {}; // ID to device
    for (const device of devices) {
      deviceIndex[device.id] = device;
    }

    const controllerDevices = devices.filter(device => device.category === 'wnykq');

    const filteredDevices: TuyaDeviceResponse[] = [];
    const pairingRemotes: Record<string, PairingRemote> = {}; // ID to remote

    for (const controller of controllerDevices) {
      const controllerRemotes = await oAuth2Client.getRemotes(controller.id);

      for (const controllerRemote of controllerRemotes) {
        const remoteDevice = deviceIndex[controllerRemote.remote_id];
        if (!oAuth2Client.isRegistered(remoteDevice.product_id, remoteDevice.id)) {
          filteredDevices.push(remoteDevice);
          pairingRemotes[remoteDevice.id] = { ...controllerRemote, controllerId: controller.id };
        }
      }
    }

    const listDevices: OAuth2DeviceResult[] = [];

    this.log('Listing devices to pair:');

    for (const device of filteredDevices) {
      const remote = pairingRemotes[device.id];
      this.log('Device:', JSON.stringify(TuyaOAuth2Util.redactFields(device)));

      const deviceSpecs =
        (await oAuth2Client
          .getSpecification(device.id)
          .catch(e => this.log('Device specification retrieval failed', e))) ?? undefined;
      const dataPoints =
        (await oAuth2Client.queryDataPoints(device.id).catch(e => this.log('Device properties retrieval failed', e))) ??
        undefined;
      const remoteKeys =
        (await oAuth2Client
          .getRemoteKeys(remote.controllerId, remote.remote_id)
          .catch(e => this.log('Remote keys retrieval failed', e))) ?? undefined;

      // GitHub #178: Some device do not have the status property at all.
      // Make sure to populate it with an empty array instead.
      if (!Array.isArray(device.status)) {
        device.status = [];
      }

      const combinedSpecification = {
        device: TuyaOAuth2Util.redactFields(device),
        specifications: deviceSpecs ?? '<not available>',
        data_points: dataPoints?.properties ?? '<not available>',
      };

      const joinedOnOff: undefined | boolean = remoteKeys?.duplicate_power;
      let muteKey: undefined | string = undefined;

      if (remoteKeys) {
        for (const key of remoteKeys.key_list) {
          if (key.key.toLowerCase() === 'mute') {
            muteKey = key.key;
            break;
          }
        }
      }

      const capabilities: string[] = [];

      if (joinedOnOff !== undefined) {
        if (joinedOnOff) {
          capabilities.push('power_button');
        } else {
          capabilities.push('on_button', 'off_button');
        }
      }

      if (muteKey !== undefined) capabilities.push('mute_button');

      const tuyaRemoteKeys = remoteKeys !== undefined ? generateKeys(remoteKeys) : [];

      const deviceProperties: OAuth2DeviceResult = {
        capabilities: capabilities,
        store: {
          tuya_capabilities: [],
          tuya_category: device.category,
          tuya_remote_keys: tuyaRemoteKeys,
          tuya_remote_category: remoteKeys?.category_id,
          tuya_joined_onoff: joinedOnOff,
          tuya_mute_key: muteKey,
        },
        capabilitiesOptions: {},
        settings: {
          deviceSpecification: JSON.stringify(combinedSpecification, undefined, 2),
        },
        name: device.name,
        data: {
          deviceId: device.id,
          productId: device.product_id,
          controllerId: remote.controllerId,
        },
      };

      switch (remoteKeys?.category_id) {
        case 1:
        // Set-top box
        // eslint-disable-next-line no-fallthrough
        case 3:
          // Television box
          deviceProperties.class = 'settopbox';
          deviceProperties.icon = 'device_classes/set-top-box.svg';
          break;
        case 2:
          // Television
          deviceProperties.class = 'tv';
          deviceProperties.icon = 'device_classes/tv.svg';
          break;
        case 4:
          // DVD
          deviceProperties.class = 'mediaplayer';
          deviceProperties.icon = 'device_classes/dvd-bluray.svg';
          break;
        case 5:
          // Air conditioner
          deviceProperties.class = 'airconditioning';
          deviceProperties.icon = 'device_classes/climate.svg';
          break;
        case 6:
          // Projector
          deviceProperties.class = 'tv';
          deviceProperties.icon = 'device_classes/projector.svg';
          break;
        case 7:
          // Speaker
          deviceProperties.class = 'speaker';
          deviceProperties.icon = 'device_classes/speaker.svg';
          break;
        case 8:
          // Fan
          deviceProperties.class = 'fan';
          deviceProperties.icon = 'device_classes/fan.svg';
          break;
        case 9:
          // Camera
          deviceProperties.class = 'camera';
          deviceProperties.icon = 'device_classes/camera.svg';
          break;
        case 10:
          // Light
          deviceProperties.class = 'light';
          deviceProperties.icon = 'device_classes/light-bulb2.svg';
          break;
        case 11:
          // Purifier
          deviceProperties.class = 'airpurifier';
          deviceProperties.icon = 'device_classes/air-purifier.svg';
          break;
        case 12:
          // Water heater
          deviceProperties.class = 'kettle';
          deviceProperties.icon = 'device_classes/kettle.svg';
          break;
      }

      this.log('Props:', JSON.stringify(deviceProperties));

      listDevices.push(deviceProperties);
    }

    return listDevices;
  }
};
