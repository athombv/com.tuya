'use strict';

const TuyaOAuth2Device = require('./TuyaOAuth2Device');

class TuyaOAuth2DeviceDoorbell extends TuyaOAuth2Device {

  async onTuyaStatus(status, changedStatusCodes) {
    await super.onTuyaStatus(status);

    if (changedStatusCodes.includes('alarm_message')) {
      try {
        const decoded = JSON.parse(Buffer.from(status['alarm_message'], 'base64').toString('utf8'));
        this.log(`Decoded Message: ${JSON.stringify(decoded)}`);

        if (decoded.cmd === 'ipc_doorbell') {
          this.log('Doorbell Rang!', decoded);

          this.homey.flow
            .getDeviceTriggerCard('doorbell_rang')
            .trigger(this)
            .catch(err => this.error(`Error Triggering Doorbell Rang: ${err.message}`));
        }
      } catch (err) {
        this.error(`Error Parsing Message: ${err.message}`);
      }
    }
  }

}

module.exports = TuyaOAuth2DeviceDoorbell;
