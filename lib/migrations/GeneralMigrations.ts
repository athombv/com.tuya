import TuyaOAuth2Device from '../TuyaOAuth2Device';

export async function performMigrations(device: TuyaOAuth2Device): Promise<void> {
  await tuyaCategoryMigration(device).catch(device.error);
}

async function tuyaCategoryMigration(device: TuyaOAuth2Device): Promise<void> {
  // tuya category migration
  const tuyaCategory = device.getStore().tuya_category;

  if (tuyaCategory === undefined) {
    device.log('Migrating Tuya category...');
    const { deviceId } = device.data;
    const deviceDefinition = await device.oAuth2Client.getDevice({
      deviceId,
    });

    await device.setStoreValue('tuya_category', deviceDefinition.category);
    device.log('Tuya category migration complete');
  }
}
