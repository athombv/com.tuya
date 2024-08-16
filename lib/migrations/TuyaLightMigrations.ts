import type TuyaOAuth2DeviceLight from '../../drivers/light/device';

export async function performMigrations(device: TuyaOAuth2DeviceLight): Promise<void> {
  await switchCapabilityMigration(device).catch(device.error);
  await otherSwitchOnDimMigration(device).catch(device.error);
}

async function switchCapabilityMigration(device: TuyaOAuth2DeviceLight): Promise<void> {
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
}

async function otherSwitchOnDimMigration(device: TuyaOAuth2DeviceLight): Promise<void> {
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
}
