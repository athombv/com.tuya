class TuyaLightMigrations {

  static async performMigrations(device) {
    await TuyaLightMigrations.switchCapabilityMigration(device).catch(device.error);
  }

  static async switchCapabilityMigration(device)     {
    // switch capabilities migration
    const tuyaSwitches = device.getStore().tuya_switches;

    if (tuyaSwitches === undefined) {
      device.log('Migrating switch capabilities...')
      const deviceStatus = await device.getStatus();

      let hasSwitchLed = false;
      let hasSwitch = false;

      const store = device.getStore();
      const tuyaCapabilities = store.tuya_capabilities;
      const tuyaSwitches = store.tuya_switches ?? [];

      for (const status of deviceStatus) {
        const tuyaCapability = status.code;
        hasSwitchLed |= tuyaCapability === 'switch_led'
        hasSwitch |= tuyaCapability === 'switch'

        if (tuyaCapability === 'switch_led' || tuyaCapability === 'switch') {
          if (!tuyaCapabilities.includes(tuyaCapability)) {
            tuyaCapabilities.push(tuyaCapability);
          }
          tuyaSwitches.push(tuyaCapability);
        }
      }

      await device.setStoreValue("tuya_capabilities", tuyaCapabilities);
      await device.setStoreValue("tuya_switches", tuyaSwitches);

      if (hasSwitch) {
        // Capability migration needs to happen
        if (hasSwitchLed) {
          // Add sub-capabilities
          await device.addCapability("onoff.switch_led");
          await device.addCapability("onoff.switch");

          await device.setCapabilityOptions("onoff.switch_led", {
            title: {
              en: `Light`
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
              en: `Other`
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
          await device.addCapability("onoff");
        }
      }
      device.log('Switch capabilities migration complete')
    }
  }
}

module.exports = TuyaLightMigrations;
