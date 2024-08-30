export const FAN_CAPABILITIES_MAPPING = {
  switch: 'onoff',
  fan_switch: 'onoff',
  fan_speed_percent: 'dim',
  // fan_speed can be both dim and legacy_fan_speed
  switch_vertical: 'fan_swing_vertical',
  switch_horizontal: 'fan_swing_horizontal',
  child_lock: 'child_lock',
  temp: 'target_temperature',
  temp_current: 'measure_temperature',
  // light - handled by superclass
  light: 'onoff.light',
  switch_led: 'onoff.light',
} as const;

export const FAN_CAPABILITIES = {
  read_write: [
    'switch',
    'fan_switch',
    'fan_speed_percent',
    'switch_horizontal',
    'switch_vertical',
    'child_lock',
    'temp',
    // Light
    'light',
    'switch_led',
  ],
  read_only: ['temp_current'],
} as const;

export type HomeyFanSettings = {
  enable_light_support: boolean;
};

export type TuyaFanSettings = Record<string, never>;
