export const FAN_CAPABILITIES_MAPPING = {
  switch: 'onoff',
  fan_speed_percent: 'dim',
  fan_speed: 'legacy_fan_speed',
  switch_vertical: 'fan_swing_vertical',
  switch_horizontal: 'fan_swing_horizontal',
  child_lock: 'child_lock',
  temp: 'target_temperature',
  temp_current: 'measure_temperature',
  // light
  work_mode: 'light_mode',
  light: 'onoff.light',
  bright_value: 'dim.light',
  temp_value: 'light_temperature',
} as const;

export const FAN_CAPABILITIES = {
  read_write: [
    'switch',
    'fan_speed_percent',
    'switch_horizontal',
    'switch_vertical',
    'child_lock',
    'temp',
    'fan_speed',
    // Light
    'light',
  ],
  read_only: ['temp_current'],
} as const;
