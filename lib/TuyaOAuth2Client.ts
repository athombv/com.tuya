import {
  TuyaCommand,
  TuyaDeviceResponse,
  TuyaDeviceSpecificationResponse,
  TuyaHome,
  TuyaScenesResponse,
  TuyaStatusResponse,
  TuyaToken,
  TuyaUserInfo,
  TuyaWebRTC,
} from '../types/TuyaApiTypes';
import { fetch, OAuth2Client } from 'homey-oauth2app';

import TuyaOAuth2Token from './TuyaOAuth2Token';
import { Response } from 'node-fetch';
import { CloudWebhook } from 'homey';
import { DeviceRegistration } from '../types/TuyaTypes';

import { URL } from 'url';

import Homey from 'homey';

import TuyaOAuth2Error from './TuyaOAuth2Error';
import * as TuyaOAuth2Constants from './TuyaOAuth2Constants';
import * as TuyaOAuth2Util from './TuyaOAuth2Util';
import { RegionCode } from './TuyaOAuth2Constants';

type BuildRequest = { opts: { method: unknown; body: unknown; headers: object }; url: string };
type OAuth2SessionInformation = { id: string; title: string };

export default class TuyaOAuth2Client extends OAuth2Client<TuyaOAuth2Token> {
  static TOKEN = TuyaOAuth2Token;
  static API_URL = '<dummy>';
  static TOKEN_URL = '<dummy>';
  static AUTHORIZATION_URL = 'https://openapi.tuyaus.com/login';
  static REDIRECT_URL = 'https://tuya.athom.com/callback';

  __updateWebhookTimeout?: NodeJS.Timeout;
  webhook?: CloudWebhook;

  // We save this information to eventually enable OAUTH2_MULTI_SESSION.
  // We can then list all authenticated users by name, e-mail and country flag.
  // This is useful for multiple account across Tuya brands & regions.
  async onGetOAuth2SessionInformation(): Promise<OAuth2SessionInformation> {
    const userInfo = await this.getUserInfo();

    return {
      id: userInfo.uid,
      title: JSON.stringify({
        name: userInfo.nick_name,
        email: userInfo.email,
        country_code: userInfo.country_code,
      }),
    };
  }

  // Sign the request
  async onBuildRequest(props: {
    method: string;
    path: string;
    json: object;
    body: object;
    query: object;
    headers: object;
  }): Promise<BuildRequest> {
    const { url, opts } = await super.onBuildRequest({ ...props });

    const token = this.getToken();

    const urlInstance = new URL(url);
    const signedHeaders = TuyaOAuth2Util.getSignedHeaders({
      accessToken: token.access_token,
      method: opts.method as string,
      path: `${urlInstance.pathname}${urlInstance.search}`,
      body: opts.body as string,
      clientId: this._clientId,
      clientSecret: this._clientSecret,
    });

    opts.headers = {
      ...opts.headers,
      ...signedHeaders,
    };

    return {
      url,
      opts,
    };
  }

  async onShouldRefreshToken(response: Response): Promise<boolean> {
    const json = (await response.json()) as { code: number };
    // @ts-expect-error legacy code
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    response.json = () => json;

    return json.code === TuyaOAuth2Constants.ERROR_CODES.ACCESS_TOKEN_EXPIRED;
  }

  // The authorization code is Base64-encoded by tuya.athom.com to embed the 'region' as well.
  // We need this to determine the API URL.
  async onGetTokenByCode({ code }: { code: string }): Promise<TuyaOAuth2Token> {
    const { region, code: authorizationCode } = JSON.parse(Buffer.from(code, 'base64').toString('utf-8'));

    const requestUrl = TuyaOAuth2Constants.API_URL[region as RegionCode];
    const requestMethod = 'GET';
    const requestPath = `/v1.0/token?code=${authorizationCode}&grant_type=${TuyaOAuth2Constants.GRANT_TYPE.OAUTH2}`; // Tuya Cloud needs query parameters in alphabetical order...
    const requestHeaders = TuyaOAuth2Util.getSignedHeaders({
      method: requestMethod,
      path: requestPath,
      clientId: this._clientId,
      clientSecret: this._clientSecret,
    });

    const response = await fetch(`${requestUrl}${requestPath}`, {
      method: requestMethod,
      headers: requestHeaders,
    });
    const result = await response.json();

    const tokenJSON = (await this.onHandleResult({ result })) as TuyaToken;
    this._token = new TuyaOAuth2Token({
      ...tokenJSON,
      region,
    });

    return this._token;
  }

  async onRefreshToken(): Promise<TuyaOAuth2Token> {
    const token = this.getToken();
    if (!token) {
      throw new TuyaOAuth2Error('Missing OAuth2 Token');
    }

    const requestUrl = TuyaOAuth2Constants.API_URL[token.region];
    const requestMethod = 'GET';
    const requestPath = `/v1.0/token/${token.refresh_token}`;
    const requestHeaders = TuyaOAuth2Util.getSignedHeaders({
      method: requestMethod,
      path: requestPath,
      clientId: this._clientId,
      clientSecret: this._clientSecret,
    });

    const response = await fetch(`${requestUrl}${requestPath}`, {
      method: requestMethod,
      headers: requestHeaders,
    });
    const result = await response.json();

    const tokenJSON = (await this.onHandleResult({ result })) as TuyaToken;

    this._token = new TuyaOAuth2Token({
      ...token.toJSON(),
      ...tokenJSON,
    });

    this.save();

    return this._token;
  }

  async onHandleResult({
    result,
    status,
  }: {
    result: {
      success: boolean;
      result: unknown;
      msg: string;
      code: number;
    };
    status?: number;
    statusText?: string;
    headers?: object;
  }): Promise<unknown> {
    if (result.success) {
      return result.result;
    }

    if (result.msg && result.code) {
      throw new TuyaOAuth2Error(`${result.msg} (Code ${result.code})`, status, result.code);
    }

    throw new TuyaOAuth2Error('Unknown Error', status, result.code);
  }

  /*
   * API Methods
   */

  async getUserInfo(): Promise<TuyaUserInfo> {
    const token = this.getToken();
    const apiUrl = TuyaOAuth2Constants.API_URL[token.region];

    // https://developer.tuya.com/en/docs/cloud/cfebf22ad3?id=Kawfjdgic5c0w
    return this.get({
      path: `${apiUrl}/v1.0/users/${token.uid}/infos`,
    });
  }

  async getDevices(): Promise<TuyaDeviceResponse[]> {
    const token = this.getToken();
    const apiUrl = TuyaOAuth2Constants.API_URL[token.region];

    // https://developer.tuya.com/en/docs/cloud/device-management?id=K9g6rfntdz78a
    return this.get({
      path: `${apiUrl}/v1.0/users/${token.uid}/devices`,
    });
  }

  getDevice({ deviceId }: { deviceId: string }): Promise<TuyaDeviceResponse> {
    const token = this.getToken();
    const apiUrl = TuyaOAuth2Constants.API_URL[token.region];

    // https://developer.tuya.com/en/docs/cloud/device-management?id=K9g6rfntdz78a
    return this.get({
      path: `${apiUrl}/v1.0/devices/${deviceId}`,
    });
  }

  async getHomes(): Promise<TuyaHome[]> {
    const token = this.getToken();
    const apiUrl = TuyaOAuth2Constants.API_URL[token.region];

    // https://developer.tuya.com/en/docs/cloud/f5dd40ed14?id=Kawfjh9hpov1n
    return this.get({
      path: `${apiUrl}/v1.0/users/${token.uid}/homes`,
    });
  }

  async getScenes(spaceId: string | number): Promise<TuyaScenesResponse> {
    const token = this.getToken();
    const apiUrl = TuyaOAuth2Constants.API_URL[token.region];

    // https://developer.tuya.com/en/docs/cloud/d7785d8964?id=Kcp2l4i0bo315
    return this.get({
      path: `${apiUrl}/v2.0/cloud/scene/rule?space_id=${spaceId}`,
    });
  }

  async triggerScene(sceneId: string): Promise<boolean> {
    const token = await this.getToken();
    const apiUrl = TuyaOAuth2Constants.API_URL[token.region];

    // https://developer.tuya.com/en/docs/cloud/89b2c8538b?id=Kcp2l54tos47r
    return this.post({
      path: `${apiUrl}/v2.0/cloud/scene/rule/${sceneId}/actions/trigger`,
    });
  }

  async getSpecification({ deviceId }: { deviceId: string }): Promise<TuyaDeviceSpecificationResponse> {
    const token = this.getToken();
    const apiUrl = TuyaOAuth2Constants.API_URL[token.region];

    // https://developer.tuya.com/en/docs/cloud/device-control?id=K95zu01ksols7
    return this.get({
      path: `${apiUrl}/v1.0/devices/${deviceId}/specifications`,
    });
  }

  async getWebRTCConfiguration({ deviceId }: { deviceId: string }): Promise<TuyaWebRTC> {
    const token = this.getToken();
    const apiUrl = TuyaOAuth2Constants.API_URL[token.region];

    // https://developer.tuya.com/en/docs/cloud/96c3154b0d?id=Kam7q5rz91dml
    return this.get({
      path: `${apiUrl}/v1.0/devices/${deviceId}/webrtc-configs`,
    });
  }

  async getStreamingLink(
    deviceId: string,
    type: 'RTSP' | 'HLS',
  ): Promise<{
    url: string;
  }> {
    const token = this.getToken();
    const apiUrl = TuyaOAuth2Constants.API_URL[token.region];

    // https://developer.tuya.com/en/docs/cloud/2ccd66883c?id=Kam7q5a9ug8b1
    return this.post({
      path: `${apiUrl}/v1.0/devices/${deviceId}/stream/actions/allocate`,
      json: {
        type: type,
      },
    });
  }

  async getDeviceStatus({ deviceId }: { deviceId: string }): Promise<TuyaStatusResponse> {
    const token = this.getToken();
    const apiUrl = TuyaOAuth2Constants.API_URL[token.region];

    // https://developer.tuya.com/en/docs/cloud/device-control?id=K95zu01ksols7
    return this.get({
      path: `${apiUrl}/v1.0/devices/${deviceId}/status`,
    });
  }

  async sendCommands({ deviceId, commands = [] }: { deviceId: string; commands: TuyaCommand[] }): Promise<boolean> {
    const token = await this.getToken();
    const apiUrl = TuyaOAuth2Constants.API_URL[token.region];

    // https://developer.tuya.com/en/docs/cloud/device-control?id=K95zu01ksols7
    return this.post({
      path: `${apiUrl}/v1.0/devices/${deviceId}/commands`,
      json: {
        commands,
      },
    }).catch((err) => {
      if (err.tuyaCode === TuyaOAuth2Constants.ERROR_CODES.DEVICE_OFFLINE) {
        throw new Error(this.homey.__('device_offline'));
      }
      throw err;
    }) as Promise<boolean>;
  }

  /*
   * Webhooks
   */
  registeredDevices = new Map<string, DeviceRegistration>();
  // Devices that are added as 'other' may be duplicates
  registeredOtherDevices = new Map<string, DeviceRegistration>();

  registerDevice(
    {
      productId,
      deviceId,
      onStatus = async (): Promise<void> => {
        /* empty */
      },
      onOnline = async (): Promise<void> => {
        /* empty */
      },
      onOffline = async (): Promise<void> => {
        /* empty */
      },
    }: DeviceRegistration,
    other = false,
  ): void {
    const register = other ? this.registeredOtherDevices : this.registeredDevices;
    register.set(`${productId}:${deviceId}`, {
      productId,
      deviceId,
      onStatus,
      onOnline,
      onOffline,
    });
    this.onUpdateWebhook();
  }

  unregisterDevice({ productId, deviceId }: { productId: string; deviceId: string }, other = false): void {
    const register = other ? this.registeredOtherDevices : this.registeredDevices;
    register.delete(`${productId}:${deviceId}`);
    this.onUpdateWebhook();
  }

  onUpdateWebhook(): void {
    if (this.__updateWebhookTimeout) {
      clearTimeout(this.__updateWebhookTimeout);
    }

    this.__updateWebhookTimeout = setTimeout(() => {
      Promise.resolve()
        .then(async () => {
          const keys = Array.from(this.registeredDevices.keys());
          const otherKeys = Array.from(this.registeredOtherDevices.keys());
          // Remove duplicate registrations
          const combinedKeys = Array.from(new Set([...keys, ...otherKeys]));

          if (combinedKeys.length === 0 && this.webhook) {
            await this.webhook.unregister();
            this.log('Unregistered Webhook');
          }

          if (combinedKeys.length > 0) {
            this.webhook = await this.homey.cloud.createWebhook(Homey.env.WEBHOOK_ID, Homey.env.WEBHOOK_SECRET, {
              $keys: combinedKeys,
            });
            this.webhook!.on('message', (message) => {
              this.log('onWebhookMessage', JSON.stringify(message));

              Promise.resolve()
                .then(async () => {
                  const key = message.headers['x-tuya-key'];

                  const registeredDevice = this.registeredDevices.get(key);
                  const registeredOtherDevice = this.registeredOtherDevices.get(key);
                  if (!registeredDevice && !registeredOtherDevice) return;

                  Promise.resolve()
                    .then(async () => {
                      switch (message.body.event) {
                        case 'status': {
                          if (!Array.isArray(message.body.data.deviceStatus)) return;

                          if (registeredDevice) {
                            await registeredDevice.onStatus(message.body.data.deviceStatus);
                          }
                          if (registeredOtherDevice) {
                            await registeredOtherDevice.onStatus(message.body.data.deviceStatus);
                          }
                          break;
                        }
                        case 'online': {
                          if (registeredDevice) {
                            await registeredDevice.onOnline();
                          }
                          if (registeredOtherDevice) {
                            await registeredOtherDevice.onOnline();
                          }
                          break;
                        }
                        case 'offline': {
                          if (registeredDevice) {
                            await registeredDevice.onOffline();
                          }
                          if (registeredOtherDevice) {
                            await registeredOtherDevice.onOffline();
                          }
                          break;
                        }
                        default: {
                          this.error(`Unknown Webhook Event: ${message.event}`);
                        }
                      }
                    })
                    .catch((err) => this.error(err));
                })
                .catch((err) => this.error(`Error Handling Webhook Message: ${err.message}`));
            });
            this.log('Registered Webhook');
          }
        })
        .catch((err) => this.error(`Error Updating Webhook: ${err.message}`));
    }, 1000);
  }
}

module.exports = TuyaOAuth2Client;
