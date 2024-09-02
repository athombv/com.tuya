import { executeMigration } from './MigrationStore';
import TuyaOAuth2DeviceFan from '../../drivers/fan/device';

export async function performMigrations(device: TuyaOAuth2DeviceFan): Promise<void> {
  await tuyaCapabilitiesMigration(device).catch(device.error);
}

async function tuyaCapabilitiesMigration(device: TuyaOAuth2DeviceFan): Promise<void> {
  await executeMigration(device, 'fan_tuya_capabilities', async () => {
    device.log('Migrating Tuya capabilities...');

    const tuyaCapabilities = [];

    const status = await device.getStatus();
    for (const tuyaCapability in status) {
      if (tuyaCapability === 'switch' || tuyaCapability === 'fan_speed_percent') {
        tuyaCapabilities.push(tuyaCapability);
      }
    }

    await device.setStoreValue('tuya_capabilities', tuyaCapabilities);

    device.log('Tuya capabilities added:', tuyaCapabilities);
  });
}
