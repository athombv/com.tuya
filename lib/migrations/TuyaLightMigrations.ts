import type TuyaOAuth2DeviceLight from '../../drivers/light/device';
import { executeMigration } from './MigrationStore';

export async function performMigrations(device: TuyaOAuth2DeviceLight): Promise<void> {
  await switchCapabilityMigration(device).catch(device.error);
  await otherSwitchOnDimMigration(device).catch(device.error);
  await fixUndefinedSpecifications(device).catch(device.error);
}

async function switchCapabilityMigration(device: TuyaOAuth2DeviceLight): Promise<void> {
  await executeMigration(device, 'light_switch_capability', async () => {
    // switch capabilities migration
    const tuyaSwitches = device.getStore().tuya_switches;

    if (tuyaSwitches === undefined) {
      device.log('Migrating switch capabilities...');
      const deviceStatus = await device.getStatus();

      let hasSwitchLed = false;
      let hasSwitch = false;

      const store = device.getStore();
      const tuyaCapabilities = store.tuya_capabilities;
      const tuyaSwitches = store.tuya_switches ?? [];

      for (const status of deviceStatus) {
        const tuyaCapability = status.code;
        hasSwitchLed = hasSwitchLed || tuyaCapability === 'switch_led';
        hasSwitch = hasSwitch || tuyaCapability === 'switch';

        if (tuyaCapability === 'switch_led' || tuyaCapability === 'switch') {
          if (!tuyaCapabilities.includes(tuyaCapability)) {
            tuyaCapabilities.push(tuyaCapability);
          }
          tuyaSwitches.push(tuyaCapability);
        }
      }

      await device.setStoreValue('tuya_capabilities', tuyaCapabilities);
      await device.setStoreValue('tuya_switches', tuyaSwitches);

      if (hasSwitch) {
        // Capability migration needs to happen
        if (hasSwitchLed) {
          // Add sub-capabilities
          await device.addCapability('onoff.switch_led');
          await device.addCapability('onoff.switch');

          await device.setCapabilityOptions('onoff.switch_led', {
            title: {
              en: `Light`,
            },
            insightsTitleTrue: {
              en: `Turned on (Light)`,
            },
            insightsTitleFalse: {
              en: `Turned off (Light)`,
            },
          });
          await device.setCapabilityOptions('onoff.switch', {
            title: {
              en: `Other`,
            },
            insightsTitleTrue: {
              en: `Turned on (Other)`,
            },
            insightsTitleFalse: {
              en: `Turned off (Other)`,
            },
          });
        } else {
          // Add missing onoff
          await device.addCapability('onoff');

          await device.setCapabilityOptions('onoff', {
            title: {
              en: 'Switch All',
            },
            setOnDim: false,
            preventInsights: true,
          });
        }
      }
      device.log('Switch capabilities migration complete');
    }
  });
}

async function otherSwitchOnDimMigration(device: TuyaOAuth2DeviceLight): Promise<void> {
  await executeMigration(device, 'light_switch_on_dim', async () => {
    // Add setOnDim: false to onoff for devices that have an additional switch

    // The Homey API throws an error if no capability options have been set before
    let capabilityOptions;
    try {
      capabilityOptions = device.getCapabilityOptions('onoff');
    } catch (err) {
      capabilityOptions = {};
    }

    const tuyaSwitches = device.getStore().tuya_switches;

    if (tuyaSwitches.length > 1 && capabilityOptions?.setOnDim !== false) {
      device.log('Migrating switch all setOnDim...');

      await device.setCapabilityOptions('onoff', {
        ...capabilityOptions,
        setOnDim: false,
      });

      device.log('Switch all setOnDim migration complete');
    }
  });
}

async function fixUndefinedSpecifications(device: TuyaOAuth2DeviceLight): Promise<void> {
  await executeMigration(device, 'light_fix_undefined_specifications', async () => {
    device.log('Ensuring light specifications are not undefined...');
    const specifications = await device.oAuth2Client.getSpecification(device.data.deviceId);
    const category = device.getStoreValue('tuya_category');

    // Set fallback values to the defaults
    if (category === 'dj') {
      await device.setStoreValue('tuya_brightness', { min: 25, max: 255, scale: 0, step: 1 });
      await device.setStoreValue('tuya_temperature', { min: 0, max: 255, scale: 0, step: 1 });
      await device.setStoreValue('tuya_colour', {
        h: { min: 0, max: 360, scale: 0, step: 1 },
        s: { min: 0, max: 255, scale: 0, step: 1 },
        v: { min: 0, max: 255, scale: 0, step: 1 },
      });
      await device.setStoreValue('tuya_brightness_v2', { min: 10, max: 1000, scale: 0, step: 1 });
      await device.setStoreValue('tuya_temperature_v2', { min: 0, max: 1000, scale: 0, step: 1 });
      await device.setStoreValue('tuya_colour_v2', {
        h: { min: 0, max: 360, scale: 0, step: 1 },
        s: { min: 0, max: 1000, scale: 0, step: 1 },
        v: { min: 0, max: 1000, scale: 0, step: 1 },
      });
    } else {
      await device.setStoreValue('tuya_brightness', { min: 10, max: 1000, scale: 0, step: 1 });
      await device.setStoreValue('tuya_temperature', { min: 0, max: 1000, scale: 0, step: 1 });
      await device.setStoreValue('tuya_colour', {
        h: { min: 0, max: 360, scale: 0, step: 1 },
        s: { min: 0, max: 1000, scale: 0, step: 1 },
        v: { min: 0, max: 1000, scale: 0, step: 1 },
      });
    }

    if (!specifications || !specifications.functions) {
      device.log('Defining light specifications completed with defaults');
      return;
    }

    // Set device-specified values
    for (const functionSpecification of specifications.functions) {
      const tuyaCapability = functionSpecification.code;
      const values = JSON.parse(functionSpecification.values);

      if (tuyaCapability === 'bright_value') {
        await device.setStoreValue('tuya_brightness', { ...device.store.tuya_brightness, ...values });
      } else if (tuyaCapability === 'bright_value_v2') {
        await device.setStoreValue('tuya_brightness_v2', { ...device.store.tuya_brightness_v2, ...values });
      } else if (tuyaCapability === 'temp_value') {
        await device.setStoreValue('tuya_temperature', { ...device.store.tuya_temperature, ...values });
      } else if (tuyaCapability === 'temp_value_v2') {
        await device.setStoreValue('tuya_temperature_v2', { ...device.store.tuya_temperature_v2, ...values });
      } else if (tuyaCapability === 'colour_data') {
        const colour_data = {
          h: { ...device.store.tuya_colour.h, ...values?.h },
          s: { ...device.store.tuya_colour.s, ...values?.s },
          v: { ...device.store.tuya_colour.v, ...values?.v },
        };
        await device.setStoreValue('tuya_colour', colour_data);
      } else if (tuyaCapability === 'colour_data_v2') {
        const colour_data = {
          h: { ...device.store.tuya_colour_v2.h, ...values?.h },
          s: { ...device.store.tuya_colour_v2.s, ...values?.s },
          v: { ...device.store.tuya_colour_v2.v, ...values?.v },
        };
        await device.setStoreValue('tuya_colour_v2', colour_data);
      }
    }
    device.log('Defining light specifications completed');
  });
}
