import TuyaDeviceWithCamera from '../../lib/camera/device';

module.exports = class TuyaOAuth2DeviceDoorbell extends TuyaDeviceWithCamera {
  DOORBELL_TRIGGER_FLOW = 'doorbell_rang';
};
