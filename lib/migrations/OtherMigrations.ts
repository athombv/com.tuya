import TuyaOAuth2Device from '../TuyaOAuth2Device';
import { executeMigration } from './MigrationStore';
import * as TuyaOAuth2Util from '../TuyaOAuth2Util';

export async function performMigrations(device: TuyaOAuth2Device): Promise<void> {
  await deviceDetailsMigration(device).catch(device.error);
}

async function deviceDetailsMigration(device: TuyaOAuth2Device): Promise<void> {
  await executeMigration(device, 'other_device_details', async () => {
    device.log('Initializing device details...');
    const { deviceId } = device.data;

    const deviceDescription = await device.oAuth2Client.getDevice({ deviceId });
    const specifications =
      (await device.oAuth2Client
        .getSpecification(deviceId)
        .catch(e => device.log('Device specification retrieval failed', e))) ?? undefined;
    const dataPoints =
      (await device.oAuth2Client
        .queryDataPoints(deviceId)
        .catch(e => device.log('Device properties retrieval failed', e))) ?? null;

    const combinedSpecification = {
      device: TuyaOAuth2Util.redactFields(deviceDescription),
      specifications: specifications ?? '<not available>',
      data_points: dataPoints?.properties ?? '<not available>',
    };

    await device.setSettings({
      deviceSpecification: JSON.stringify(combinedSpecification),
    });

    device.log('Finished initializing device details...');
  });
}
