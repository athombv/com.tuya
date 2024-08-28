import type TuyaOAuth2Device from '../TuyaOAuth2Device';

const storeKey = '_migrations';

/** Execute a migration when not already done, based on the supplied migration id. */
export async function executeMigration(
  device: TuyaOAuth2Device,
  migrationId: string,
  migration: () => Promise<void>,
): Promise<void> {
  let migrations: string[] | undefined = device.getStoreValue(storeKey);
  if (!Array.isArray(migrations)) {
    migrations = [];
  }

  if (migrations.includes(migrationId)) {
    return;
  }

  await migration();

  migrations.push(migrationId);
  await device.setStoreValue(storeKey, migrations).catch(device.error);
}
