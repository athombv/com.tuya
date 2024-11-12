import { ScaledProperty } from '../../types/TuyaTypes';

export const DEHUMIDIFIER_CAPABILITY_MAPPING = {
  switch: 'onoff',
  child_lock: 'child_lock',
  sleep: 'night_mode',
  defrost: 'frost_guard',
  swing: 'fan_swing_horizontal',
  mode: 'enum.dehumidifier_mode',
  fan_speed_enum: 'legacy_fan_speed',
  dehumidify_set_enum: 'enum.target_humidity',
  dehumidify_set_value: 'target_humidity',
  pm25: 'measure_pm25',
  temp_indoor: 'measure_temperature',
  humidity_indoor: 'measure_humidity',
} as const;

export const DEHUMIDIFIER_CAPABILITIES = {
  read_write: [
    'switch',
    'child_lock',
    'sleep',
    'defrost',
    'fan_speed_enum',
    'dehumidify_set_value',
    'dehumidify_set_enum',
    'swing',
    'mode',
  ],
  read_only_scaled: ['pm25', 'temp_indoor', 'humidity_indoor'],
} as const;

export type HomeyDehumidifierSettings = {
  measure_humidity_scaling: ScaledProperty;
  measure_temperature_scaling: ScaledProperty;
  measure_pm25_scaling: ScaledProperty;
};

export type TuyaDehumidifierSettings = never;
