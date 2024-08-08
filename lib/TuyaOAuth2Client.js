'use strict';

const { URL } = require('url');

const Homey = require('homey');
const { OAuth2Client, fetch } = require('homey-oauth2app');

const TuyaOAuth2Token = require('./TuyaOAuth2Token');
const TuyaOAuth2Error = require('./TuyaOAuth2Error');
const TuyaOAuth2Constants = require('./TuyaOAuth2Constants');
const TuyaOAuth2Util = require('./TuyaOAuth2Util');

class TuyaOAuth2Client extends OAuth2Client {

  static TOKEN = TuyaOAuth2Token;
  static API_URL = '<dummy>';
  static TOKEN_URL = '<dummy>';
  static AUTHORIZATION_URL = 'https://openapi.tuyaus.com/login';
  static REDIRECT_URL = 'https://tuya.athom.com/callback';

  /*
   * OAuth2Client Overloads
   */

  // We save this information to eventually enable OAUTH2_MULTI_SESSION.
  // We can then list all authenticated users by name, e-mail and country flag.
  // This is useful for multiple account across Tuya brands & regions.
  async onGetOAuth2SessionInformation() {
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
  async onBuildRequest({ ...props }) {
    const {
      url,
      opts,
    } = await super.onBuildRequest({ ...props });

    const token = await this.getToken();

    const urlInstance = new URL(url);
    const signedHeaders = TuyaOAuth2Util.getSignedHeaders({
      accessToken: token.access_token,
      method: opts.method,
      path: `${urlInstance.pathname}${urlInstance.search}`,
      body: opts.body,
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

  async onShouldRefreshToken(response) {
    const json = await response.json();
    response.json = () => json;

    return json.code === TuyaOAuth2Constants.ERROR_CODES.ACCESS_TOKEN_EXPIRED;
  }

  // The authorization code is Base64-encoded by tuya.athom.com to embed the 'region' as well.
  // We need this to determine the API URL.
  async onGetTokenByCode({ code }) {
    const {
      region,
      code: authorizationCode,
    } = JSON.parse(Buffer.from(code, 'base64').toString('utf-8'));

    const requestUrl = TuyaOAuth2Constants.API_URL[region];
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

    const tokenJSON = await this.onHandleResult({ result });
    this._token = new TuyaOAuth2Token({
      ...tokenJSON,
      region,
    });

    return this._token;
  }

  async onRefreshToken() {
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

    const tokenJSON = await this.onHandleResult({ result });
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
  }) {
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

  // Documentation: https://developer.tuya.com/en/docs/cloud/cfebf22ad3?id=Kawfjdgic5c0w
  async getUserInfo() {
    const token = await this.getToken();
    const apiUrl = TuyaOAuth2Constants.API_URL[token.region];

    return this.get({
      path: `${apiUrl}/v1.0/users/${token.uid}/infos`,
    });
  }

  async getDevices() {
    const token = await this.getToken();
    const apiUrl = TuyaOAuth2Constants.API_URL[token.region];

    return this.get({
      path: `${apiUrl}/v1.0/users/${token.uid}/devices`,
    });
  }

  async getDevice({
    deviceId,
  }) {
    const token = await this.getToken();
    const apiUrl = TuyaOAuth2Constants.API_URL[token.region];

    return this.get({
      path: `${apiUrl}/v1.0/devices/${deviceId}`,
    });
  }

  async getHomes() {
    const token = await this.getToken();
    const apiUrl = TuyaOAuth2Constants.API_URL[token.region];

    return this.get({
      path: `${apiUrl}/v1.0/users/${token.uid}/homes`,
    });
  }

  async getScenes(spaceId) {
    const token = await this.getToken();
    const apiUrl = TuyaOAuth2Constants.API_URL[token.region];

    return this.get({
      path: `${apiUrl}/v2.0/cloud/scene/rule?space_id=${spaceId}`,
    });
  }

  async triggerScene(sceneId) {
    const token = await this.getToken();
    const apiUrl = TuyaOAuth2Constants.API_URL[token.region];

    return this.post({
      path: `${apiUrl}/v2.0/cloud/scene/rule/${sceneId}/actions/trigger`,
    });
  }

  async getSpecification({
    deviceId,
  }) {
    const token = await this.getToken();
    const apiUrl = TuyaOAuth2Constants.API_URL[token.region];

    return this.get({
      path: `${apiUrl}/v1.0/iot-03/devices/${deviceId}/specification`,
    });
  }

  async getWebRTCConfiguration({
    deviceId,
  }) {
    const token = await this.getToken();
    const apiUrl = TuyaOAuth2Constants.API_URL[token.region];

    return this.get({
      path: `${apiUrl}/v1.0/devices/${deviceId}/webrtc-configs`,
    });
  }

  /**
   * @param {string} deviceId - The Tuya ID of the camera device
   * @param {"RTSP" | "HLS"} type - The type of stream for which to generate a link
   */
  async getStreamingLink(deviceId, type ) {
    const token = await this.getToken();
    const apiUrl = TuyaOAuth2Constants.API_URL[token.region];

    return this.post({
      path: `${apiUrl}/v1.0/devices/${deviceId}/stream/actions/allocate`,
      json: {
        type: type,
      },
    })
  }

  // Documentation: https://developer.tuya.com/en/docs/cloud/d65d46643b?id=Kb3ob6g63p4xh
  async getDeviceStatus({
    deviceId,
  }) {
    const token = await this.getToken();
    const apiUrl = TuyaOAuth2Constants.API_URL[token.region];

    return this.get({
      path: `${apiUrl}/v1.0/devices/${deviceId}/status`,
    });
  }

  // Documentation: https://developer.tuya.com/en/docs/cloud/e2512fb901?id=Kag2yag3tiqn5
  async sendCommands({
    deviceId,
    commands = [],
  }) {
    const token = await this.getToken();
    const apiUrl = TuyaOAuth2Constants.API_URL[token.region];

    return this.post({
      path: `${apiUrl}/v1.0/devices/${deviceId}/commands`,
      json: {
        commands,
      },
    }).catch(err => {
      if (err.tuyaCode === TuyaOAuth2Constants.ERROR_CODES.DEVICE_OFFLINE) {
        throw new Error(this.homey.__('device_offline'));
      }
      throw err;
    });
  }

  /*
   * Webhooks
   */
  registeredDevices = new Map();
  // Devices that are added as 'other' may be duplicates
  registeredOtherDevices = new Map();

  async registerDevice(
    {
      productId,
      deviceId,
      onStatus = () => {},
      onOnline = () => {},
      onOffline = () => {},
    },
    other = false,
  ) {
    const register = other
      ? this.registeredOtherDevices
      : this.registeredDevices;
    register.set(`${productId}:${deviceId}`, {
      productId,
      deviceId,
      onStatus,
      onOnline,
      onOffline,
    });
    this.onUpdateWebhook();
  }

  async unregisterDevice({ productId, deviceId }, other = false) {
    const register = other
      ? this.registeredOtherDevices
      : this.registeredDevices;
    register.delete(`${productId}:${deviceId}`);
    this.onUpdateWebhook();
  }

  onUpdateWebhook() {
    if (this.__updateWebhookTimeout) {
      clearTimeout(this.__updateWebhookTimeout);
    }

    this.__updateWebhookTimeout = setTimeout(() => {
      Promise.resolve().then(async () => {
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
          this.webhook.on('message', message => {
            this.log('onWebhookMessage', JSON.stringify(message));

            Promise.resolve().then(async () => {
              const key = message.headers['x-tuya-key'];

              const registeredDevice = this.registeredDevices.get(key);
              const registeredOtherDevice = this.registeredOtherDevices.get(key);
              if (!registeredDevice && !registeredOtherDevice) return;

              Promise.resolve().then(async () => {
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
              }).catch(err => this.error(err));
            }).catch(err => this.error(`Error Handling Webhook Message: ${err.message}`));
          });
          this.log('Registered Webhook');
        }
      }).catch(err => this.error(`Error Updating Webhook: ${err.message}`));
    }, 1000);
  }

}

module.exports = TuyaOAuth2Client;
