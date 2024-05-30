'use strict';

const Homey = require('homey');
const { OAuth2Client, fetch } = require('homey-oauth2app');

const TuyaOAuth2Token = require('./TuyaOAuth2Token');
const TuyaOAuth2Error = require('./TuyaOAuth2Error');
const TuyaOAuth2Constants = require('./TuyaOAuth2Constants');

class TuyaOAuth2Client extends OAuth2Client {

  static TOKEN = TuyaOAuth2Token;

  registeredDevices = new Map();

  async onInit(...props) {
    await super.onInit(...props);
  }

  async registerDevice({
    productId,
    deviceId,
    onStatus = () => { },
  }) {
    this.registeredDevices.set(`${productId}:${deviceId}`, {
      productId,
      deviceId,
      onStatus,
    });
    this.onUpdateWebhook();
  }

  async unregisterDevice({
    productId,
    deviceId,
  }) {
    this.registeredDevices.delete(`${productId}:${deviceId}`);
    this.onUpdateWebhook();
  }

  onUpdateWebhook() {
    Promise.resolve().then(async () => {
      const keys = Array.from(this.registeredDevices.keys());

      if (this.webhook) {
        await this.webhook.unregister();
        this.log('Unregistered Webhook');
      }

      if (Object.keys(keys).length > 0) {
        this.webhook = await this.homey.cloud.createWebhook(Homey.env.WEBHOOK_ID, Homey.env.WEBHOOK_SECRET, {
          $keys: keys,
        });
        this.webhook.on('message', message => {
          Promise.resolve().then(async () => {
            const key = message.headers['x-tuya-key'];

            const registeredDevice = this.registeredDevices.get(key);
            if (!registeredDevice) return;

            Promise.resolve().then(async () => {
              switch (message.body.event) {
                case 'status': {
                  await registeredDevice.onStatus(message.body.data.deviceStatus);
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
  }

  /*
   * OAuth2Client Overloads
   */
  async onShouldRefreshToken(response) {
    const json = await response.json();
    response.json = () => json;

    return json.code === TuyaOAuth2Constants.ERROR_CODES.ACCESS_TOKEN_EXPIRED;
  }

  async onGetTokenByCode({ code }) {
    // The query parameter order is important!
    // There's a bug in Tuya's Cloud, that won't calculate the signature correctly,
    // if they're not in this order.
    const response = await fetch(`${this._tokenUrl}?code=${code}&grant_type=${TuyaOAuth2Constants.GRANT_TYPE.OAUTH2}`);
    const result = await response.json();
    const tokenJSON = await this.onHandleResult({ result });
    this._token = new this._tokenConstructor(tokenJSON);
    return this._token;
  }

  async onRefreshToken() {
    const token = this.getToken();
    if (!token) {
      throw new TuyaOAuth2Error('Missing OAuth2 Token');
    }

    const response = await fetch(`${this._tokenUrl}/${token.refresh_token}`);

    const result = await response.json();
    const tokenJSON = await this.onHandleResult({ result });
    this._token = new this._tokenConstructor(tokenJSON);
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
   * Documentation: https://developer.tuya.com/en/docs/cloud/General-Device-Management?id=Kb3h47ktstett
   */

  async getDevices() {
    const token = await this.getToken();
    return this.get({
      path: `/v1.0/users/${token.uid}/devices`,
    });
  }

  async getDevice({
    deviceId,
  }) {
    return this.get({
      path: `/v1.0/devices/${deviceId}`,
    });
  }

  async getDeviceStatus({
    deviceId,
  }) {
    return this.get({
      path: `/v1.0/devices/${deviceId}/status`,
    });
  }

  async sendCommands({
    deviceId,
    commands = [],
  }) {
    return this.post({
      path: `/v1.0/devices/${deviceId}/commands`,
      json: {
        commands,
      },
    }).catch(err => {
      if (err.tuyaCode === TuyaOAuth2Constants.ERROR_CODES.DEVICE_OFFLINE) {
        throw new Error('Device Offline');
      }
      throw err;
    });
  }

}

module.exports = TuyaOAuth2Client;
