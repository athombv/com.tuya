export const SIREN_CAPABILITIES_MAPPING = {
  alarm_switch: 'onoff',
};

export const SIREN_SETTING_LABELS = {
  alarm_volume: 'Alarm volume',
} as const;

export const SIREN_CAPABILITIES = {
  read_write: [],
  read_only: [],
  setting: ['alarm_volume'],
};

export const SIREN_FLOWS = {
  setting: ['alarm_volume'],
} as const;
