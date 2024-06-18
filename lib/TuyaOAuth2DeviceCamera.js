'use strict';

const TuyaOAuth2Device = require('./TuyaOAuth2Device');

class TuyaOAuth2DeviceCamera extends TuyaOAuth2Device {

  constructor(...props) {
    super(...props);


  }

  async onOAuth2Init() {
    await super.onOAuth2Init();

    this.image = await this.homey.images.createImage();
    this.image.setStream(async (stream) => {
      const captureImageResult = await this.oAuth2Client.captureImage({
        deviceId: this.data.deviceId,
      }); // This currently throws 'permission deny (Code 1106)'

      const res = await fetch("http://placekitten.com/300/300");
      if (!res.ok) {
        throw new Error("Invalid Response");
      }

      return res.body.pipe(stream);
    });

    await this.setCameraImage('main', 'Image', this.image);
  }

  async onTuyaStatus(status) {
    await super.onTuyaStatus(status);

  }

}

module.exports = TuyaOAuth2DeviceCamera;
