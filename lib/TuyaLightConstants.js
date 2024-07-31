'use strict'

class TuyaLightConstants {
  static PIR_CAPABILITIES = {
    read_write: [],
    read_only: ['pir_state'],
    setting: [
      'switch_pir', // Turn motion detection on/off
      'pir_delay', // change motion detection duration
      'pir_sensitivity', // Change motion detection level
      'cds', // Change luminance detection level
      'standby_time', // Change standby duration
    ],
  }

  static LIGHT_SETTING_LABELS = {
    switch_pir: "Motion Detection",
    pir_sensitivity: "Motion Sensitivity",
    pir_delay: "Motion Delay",
    cds: "Luminance Detection",
    standby_on: "Standby Light",
    standby_time: "Standby Time",
    standby_bright: "Standby Brightness",
  }
}

module.exports = TuyaLightConstants;
