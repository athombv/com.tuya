import Homey, { CloudWebhook } from 'homey';
import { fetch, OAuth2Client } from 'homey-oauth2app';
import { nanoid } from 'nanoid';
import { Response } from 'node-fetch';

import { URL } from 'url';
import {
  TuyaCommand,
  type TuyaDeviceDataPointResponse,
  TuyaDeviceResponse,
  TuyaDeviceSpecificationResponse,
  TuyaHome,
  TuyaScenesResponse,
  TuyaStatusResponse,
  TuyaToken,
  TuyaUserInfo,
  TuyaWebRTC,
} from '../types/TuyaApiTypes';
import { DeviceRegistration } from '../types/TuyaTypes';
import * as TuyaOAuth2Constants from './TuyaOAuth2Constants';
import { RegionCode } from './TuyaOAuth2Constants';

import TuyaOAuth2Error from './TuyaOAuth2Error';

import TuyaOAuth2Token from './TuyaOAuth2Token';
import * as TuyaOAuth2Util from './TuyaOAuth2Util';
import TuyaWebhookParser from './webhooks/TuyaWebhookParser';

type BuildRequest = { opts: { method: unknown; body: unknown; headers: object }; url: string };
type OAuth2SessionInformation = { id: string; title: string };

export default class TuyaOAuth2Client extends OAuth2Client<TuyaOAuth2Token> {
  static TOKEN = TuyaOAuth2Token;
  static API_URL = '<dummy>';
  static TOKEN_URL = '<dummy>';
  static AUTHORIZATION_URL = 'https://openapi.tuyaus.com/login';
  static REDIRECT_URL = 'https://tuya.athom.com/callback';

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
    // https://developer.tuya.com/en/docs/cloud/cfebf22ad3?id=Kawfjdgic5c0w
    return this._get(`/v1.0/users/${this.getToken().uid}/infos`);
  }

  async getDevices(): Promise<TuyaDeviceResponse[]> {
    // https://developer.tuya.com/en/docs/cloud/device-management?id=K9g6rfntdz78a
    return this._get(`/v1.0/users/${this.getToken().uid}/devices`);
  }

  async getDevice({ deviceId }: { deviceId: string }): Promise<TuyaDeviceResponse> {
    // https://developer.tuya.com/en/docs/cloud/device-management?id=K9g6rfntdz78a
    return this._get(`/v1.0/devices/${deviceId}`);
  }

  async getHomes(): Promise<TuyaHome[]> {
    // https://developer.tuya.com/en/docs/cloud/f5dd40ed14?id=Kawfjh9hpov1n
    return this._get(`/v1.0/users/${this.getToken().uid}/homes`);
  }

  async getScenes(spaceId: string | number): Promise<TuyaScenesResponse> {
    // https://developer.tuya.com/en/docs/cloud/d7785d8964?id=Kcp2l4i0bo315
    return this._get(`/v2.0/cloud/scene/rule?space_id=${spaceId}`);
  }

  async triggerScene(sceneId: string): Promise<boolean> {
    // https://developer.tuya.com/en/docs/cloud/89b2c8538b?id=Kcp2l54tos47r
    return this._post(`/v2.0/cloud/scene/rule/${sceneId}/actions/trigger`);
  }

  async getSpecification(deviceId: string): Promise<TuyaDeviceSpecificationResponse> {
    // https://developer.tuya.com/en/docs/cloud/device-control?id=K95zu01ksols7
    return this._get(`/v1.0/devices/${deviceId}/specifications`);
  }

  async queryDataPoints(deviceId: string): Promise<TuyaDeviceDataPointResponse> {
    // https://developer.tuya.com/en/docs/cloud/116cc8bf6f?id=Kcp2kwfrpe719
    return this._get(`/v2.0/cloud/thing/${deviceId}/shadow/properties`);
  }

  async setDataPoint(deviceId: string, dataPointId: string, value: unknown): Promise<void> {
    // https://developer.tuya.com/en/docs/cloud/c057ad5cfd?id=Kcp2kxdzftp91
    const payload = {
      properties: JSON.stringify({
        [dataPointId]: value,
      }),
    };
    return this._post(`/v2.0/cloud/thing/${deviceId}/shadow/properties/issue`, payload);
  }

  async getWebRTCConfiguration({ deviceId }: { deviceId: string }): Promise<TuyaWebRTC> {
    // https://developer.tuya.com/en/docs/cloud/96c3154b0d?id=Kam7q5rz91dml
    return this._get(`/v1.0/devices/${deviceId}/webrtc-configs`);
  }

  async getStreamingLink(
    deviceId: string,
    type: 'RTSP' | 'HLS',
  ): Promise<{
    url: string;
  }> {
    // https://developer.tuya.com/en/docs/cloud/2ccd66883c?id=Kam7q5a9ug8b1
    return this._post(`/v1.0/devices/${deviceId}/stream/actions/allocate`, {
      type: type,
    });
  }

  async getDeviceStatus({ deviceId }: { deviceId: string }): Promise<TuyaStatusResponse> {
    // https://developer.tuya.com/en/docs/cloud/device-control?id=K95zu01ksols7
    return this._get(`/v1.0/devices/${deviceId}/status`);
  }

  async sendCommands({ deviceId, commands = [] }: { deviceId: string; commands: TuyaCommand[] }): Promise<boolean> {
    // https://developer.tuya.com/en/docs/cloud/device-control?id=K95zu01ksols7
    return this._post(`/v1.0/devices/${deviceId}/commands`, { commands: commands }).catch(err => {
      if (err.tuyaCode === TuyaOAuth2Constants.ERROR_CODES.DEVICE_OFFLINE) {
        throw new Error(this.homey.__('device_offline'));
      }
      throw err;
    }) as Promise<boolean>;
  }

  private async _get<T>(path: string): Promise<T> {
    path = `${TuyaOAuth2Constants.API_URL[this.getToken().region]}${path}`;

    const requestId = nanoid();
    this.log('GET', requestId, path);
    return await this.get<T>({ path }).then(result => {
      this.log('GET Response', requestId, JSON.stringify(result));
      return result;
    });
  }

  private async _post<T>(path: string, payload?: unknown): Promise<T> {
    path = `${TuyaOAuth2Constants.API_URL[this.getToken().region]}${path}`;

    const requestId = nanoid();
    this.log('POST', requestId, path, JSON.stringify(payload));
    return await this.post<T>({ path, json: payload }).then(result => {
      this.log('POST Response', requestId, JSON.stringify(result));

      return result;
    });
  }

  /*
   * Webhooks
   */
  private __updateWebhookTimeout?: NodeJS.Timeout;
  private webhook?: CloudWebhook;
  private webhookParser = new TuyaWebhookParser(this);
  private registeredDevices = new Map<string, DeviceRegistration>();
  // Devices that are added as 'other' may be duplicates
  private registeredOtherDevices = new Map<string, DeviceRegistration>();

  registerDevice(
    {
      productId,
      deviceId,
      onStatus = async (): Promise<void> => {
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
    });
    this.onUpdateWebhook();
  }

  unregisterDevice({ productId, deviceId }: { productId: string; deviceId: string }, other = false): void {
    const register = other ? this.registeredOtherDevices : this.registeredDevices;
    register.delete(`${productId}:${deviceId}`);
    this.onUpdateWebhook();
  }

  isRegistered(productId: string, deviceId: string, other = false): boolean {
    const register = other ? this.registeredOtherDevices : this.registeredDevices;
    return register.has(`${productId}:${deviceId}`);
  }

  onUpdateWebhook(): void {
    if (this.__updateWebhookTimeout) {
      this.homey.clearTimeout(this.__updateWebhookTimeout);
    }

    this.__updateWebhookTimeout = this.homey.setTimeout(() => {
      Promise.resolve()
        .then(async () => {
          const keys = Array.from(this.registeredDevices.keys());
          const otherKeys = Array.from(this.registeredOtherDevices.keys());
          // Remove duplicate registrations
          const combinedKeys = Array.from(new Set([...keys, ...otherKeys]));

          if (this.webhook) {
            await this.webhook
              .unregister()
              .then(() => this.log('Unregistered existing webhook'))
              .catch(this.error);
          }

          if (combinedKeys.length > 0) {
            this.webhook = await this.homey.cloud.createWebhook(Homey.env.WEBHOOK_ID, Homey.env.WEBHOOK_SECRET, {
              $keys: combinedKeys,
            });

            this.webhook?.on('message', async message => {
              this.log('Incoming webhook', JSON.stringify(message));

              const key = message.headers['x-tuya-key'];
              const registeredDevice = this.registeredDevices.get(key) ?? null;
              const registeredOtherDevice = this.registeredOtherDevices.get(key) ?? null;
              if (!registeredDevice && !registeredOtherDevice) {
                this.log('No matching devices found for webhook data');
                return;
              }

              await this.webhookParser
                .handle([registeredDevice, registeredOtherDevice], message.body)
                .catch(err => this.error(`Error Handling Webhook Message: ${err.message}`));
            });

            this.log('Registered webhook', JSON.stringify(combinedKeys));
          }
        })
        .catch(err => this.error(`Error updating webhook: ${err.message}`));
    }, 1000);
  }
}

TuyaOAuth2Client.setMaxListeners(Infinity);
module.exports = TuyaOAuth2Client;
