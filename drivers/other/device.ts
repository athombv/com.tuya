import TuyaOAuth2Device from '../../lib/TuyaOAuth2Device';
import * as OtherMigrations from '../../lib/migrations/OtherMigrations';

module.exports = class TuyaOAuth2DeviceOther extends TuyaOAuth2Device {
  async performMigrations(): Promise<void> {
    await super.performMigrations();
    await OtherMigrations.performMigrations(this);
  }
};
