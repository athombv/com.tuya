import { HUMAN_SENSOR_CAPABILITIES } from '../../drivers/sensor_human/TuyaHumanSensorConstants';
import TuyaOAuth2DeviceSensor from '../TuyaOAuth2DeviceSensor';
import { constIncludes } from '../TuyaOAuth2Util';
import { executeMigration } from './MigrationStore';

export async function performMigrations(device: TuyaOAuth2DeviceSensor): Promise<void> {
  await addBatteryPercentageMigration(device).catch(device.error);
  await addTemperAlarmMigration(device).catch(device.error);

  if (device.driver.id === 'sensor_human') {
    await redoHumanPresenceCapabilities(device).catch(device.error);
  }
}

async function addBatteryPercentageMigration(device: TuyaOAuth2DeviceSensor): Promise<void> {
  await executeMigration(device, 'sensor_battery_percentage', async () => {
    if (device.hasCapability('measure_battery') || device.hasCapability('alarm_battery')) {
      // Don't touch existing devices that already have a battery related capability
      device.log('Battery percentage migration skipped');

      return;
    }

    device.log('Migrating battery percentage...');

    const status = await device.getStatus();
    const batteryPercentage = status.find(s => s.code === 'battery_percentage');
    if (!batteryPercentage) {
      device.log('Battery percentage not supported');
      return;
    }

    await device.addCapability('measure_battery');
    await device.safeSetCapabilityValue('measure_battery', batteryPercentage.value);

    device.log('Battery percentage added');
  });
}

async function addTemperAlarmMigration(device: TuyaOAuth2DeviceSensor): Promise<void> {
  await executeMigration(device, 'sensor_temper_alarm', async () => {
    if (device.hasCapability('alarm_tamper')) {
      return;
    }

    device.log('Migrating tamper alarm...');

    const status = await device.getStatus();
    const temperAlarm = status.find(s => s.code === 'temper_alarm');
    if (!temperAlarm) {
      device.log('Tamper alarm not supported');
      return;
    }

    await device.addCapability('alarm_tamper');
    await device.safeSetCapabilityValue('alarm_tamper', temperAlarm.value);

    device.log('Tamper alarm added');
  });
}

async function redoHumanPresenceCapabilities(device: TuyaOAuth2DeviceSensor): Promise<void> {
  await executeMigration(device, 'sensor_human_capabilities', async () => {
    device.log('Migrating human motion sensor');

    const tuyaCapabilities = [];
    for (const status of await device.getStatus()) {
      const tuyaCapability = status.code;

      if (tuyaCapability === 'presence_state') {
        tuyaCapabilities.push(tuyaCapability);
        await device.addCapability('alarm_human');
      } else if (constIncludes(HUMAN_SENSOR_CAPABILITIES.setting, tuyaCapability)) {
        tuyaCapabilities.push(tuyaCapability);
      }
    }

    await device.setStoreValue('tuya_capabilities', tuyaCapabilities);

    device.log('Human motion sensor migrated', tuyaCapabilities);
  });
}
