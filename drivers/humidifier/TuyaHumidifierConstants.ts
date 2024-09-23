export const HUMIDIFIER_CAPABILITY_MAPPING = {
  switch: 'onoff',
  switch_spray: 'onoff.spray',
  temp_set: 'target_temperature',
  humidity_set: 'target_humidity',
  sleep: 'night_mode',
  temp_current: 'measure_temperature',
  humidity_current: 'measure_humidity',
  mode: 'enum.fog_mode',
  spray_mode: 'enum.spray_mode',
  level: 'enum.spray_level',
  level_current: 'measure_content_volume',
} as const;

export const HUMIDIFIER_CAPABILITIES = {
  read_write: ['switch', 'switch_spray', 'mode', 'spray_mode', 'level', 'temp_set', 'humidity_set', 'sleep'],
  read_only: ['temp_current', 'humidity_current', 'level_current'],
} as const;

export const HUMIDIFIER_FLOWS = {
  onoff: ['onoff.spray'],
  boolean: ['night_mode'],
  enum: ['enum.spray_mode', 'enum.spray_level'],
} as const;
