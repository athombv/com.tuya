'use strict';

const { OAuth2Client, fetch } = require('homey-oauth2app');
const SocketIOClient = require('socket.io-client');

const TuyaOAuth2Token = require('./TuyaOAuth2Token');
const TuyaOAuth2Error = require('./TuyaOAuth2Error');
const TuyaOAuth2Constants = require('./TuyaOAuth2Constants');

class TuyaOAuth2Client extends OAuth2Client {

  static TOKEN = TuyaOAuth2Token;

  registeredDevices = new Map();

  async onInit(...props) {
    await super.onInit(...props);

    this.io = SocketIOClient(this.homey.app.proxyUrl, {
      transports: ['websocket'],
    });
    this.io.on('error', err => {
      this.log(`[SocketIOClient] Error: ${err.message}`);
    });
    this.io.on('connect', () => {
      this.log('[SocketIOClient] Connect');

      // Register devices
      for (const { productId, deviceId } of this.registeredDevices.values()) {
        this.io.emit('registerDevice', {
          productId,
          deviceId,
        });
      }
    });
    this.io.on('connect_error', err => {
      this.error(`[SocketIOClient] Connect Error: ${err.message}`);
    });
    this.io.on('disconnect', () => {
      this.log('[SocketIOClient] Disconnect');
    });
    this.io.on('status', ({
      productId,
      deviceId,
      deviceStatus,
    }) => {
      const registeredDevice = this.registeredDevices.get(`${productId}:${deviceId}`);
      if (!registeredDevice) return;

      Promise.resolve().then(async () => {
        await registeredDevice.onStatus(deviceStatus);
      }).catch(err => this.error(err));
    });
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

    this.io.emit('registerDevice', {
      productId,
      deviceId,
    });
  }

  async unregisterDevice({
    productId,
    deviceId,
  }) {
    this.registeredDevices.delete(`${productId}:${deviceId}`);

    this.io.emit('unregisterDevice', {
      productId,
      deviceId,
    });
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
