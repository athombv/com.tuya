'use strict';

const { OAuth2Device } = require('homey-oauth2app');
const TuyaOAuth2Util = require('./TuyaOAuth2Util');

/**
 * @extends OAuth2Device
 * @hideconstructor
 */
class TuyaOAuth2Device extends OAuth2Device {

  constructor(...props) {
    super(...props);

    this.__status = {};
    this.__sync = this.__sync.bind(this);
    this.onTuyaStatus = this.onTuyaStatus.bind(this);
  }

  static SYNC_INTERVAL = null; // Set to number n to sync every n ms

  /*
   * OAuth2
   */
  async onOAuth2Init() {
    await super.onOAuth2Init();

    this.oAuth2Client.registerDevice({
      ...this.getData(),
      onStatus: async statuses => {
        const status = TuyaOAuth2Util.convertStatusArrayToStatusObject(statuses);
        await this.__onTuyaStatus(status);
      },
    });

    if (typeof this.constructor.SYNC_INTERVAL === 'number') {
      this.__syncInterval = this.homey.setInterval(this.__sync, this.constructor.SYNC_INTERVAL);
    }
    await this.__sync();

    this.log(`Inited: ${this.getName()}`);
  }

  async onOAuth2Uninit() {
    await super.onOAuth2Uninit();

    if (this.__syncInterval) {
      this.homey.clearInterval(this.__syncInterval);
    }

    if (this.oAuth2Client) {
      this.oAuth2Client.unregisterDevice({
        ...this.getData(),
      });
    }
  }

  /*
   * Tuya
   */
  async __onTuyaStatus(status) {
    this.__status = {
      ...this.__status,
      ...status,
    };

    await this.onTuyaStatus(this.__status);
  }

  async onTuyaStatus(status) {
    if (status.online === true) {
      this.setAvailable().catch(this.error);
    }

    if (status.online === false) {
      this.setUnavailable('Tuya Device Offline').catch(this.error);
    }

    // Overload Me
  }

  async __sync() {
    Promise.resolve().then(async () => {
      this.log('Syncing...');
      const { deviceId } = this.getData();
      const device = await this.oAuth2Client.getDevice({ deviceId });

      const status = TuyaOAuth2Util.convertStatusArrayToStatusObject(device.status);
      await this.__onTuyaStatus({
        ...status,
        online: device.online,
      });
    }).catch(err => this.error('Error Syncing:', err));
  }

}

module.exports = TuyaOAuth2Device;
