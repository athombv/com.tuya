import { ScaledProperty } from '../../types/TuyaTypes';
import TRANSLATIONS from './translations.json';

export const THERMOSTAT_CAPABILITIES_MAPPING = {
  switch: 'onoff',
  eco: 'eco_mode',
  temp_set: 'target_temperature',
  child_lock: 'child_lock',
  switch_vertical: 'fan_swing_vertical',
  switch_horizontal: 'fan_swing_horizontal',
  level: 'legacy_fan_speed',
  sleep: 'night_mode',
  frost: 'frost_guard',
  work_power: 'measure_power',
  temp_current: 'measure_temperature',
  window_state: 'open_window_sensor',
  battery_percentage: 'measure_battery',
  humidity: 'measure_humidity',
  mode: 'thermostat_mode',
} as const;

export const THERMOSTAT_CAPABILITIES = {
  read_write: [
    'switch',
    'eco',
    'child_lock',
    'switch_vertical',
    'switch_horizontal',
    'sleep',
    'frost',
    'level',
    'mode',
  ],
  read_only: ['window_state', 'battery_percentage'],
  read_scaled: ['temp_set', 'work_power', 'temp_current', 'humidity'],
  setting: ['capacity_set', 'temp_correction', 'sensor_choose', 'backlight', 'backlight_enum', 'window_check'],
} as const;

export const THERMOSTAT_FLOWS = {
  capability_action: [
    'night_mode',
    'frost_guard',
    'eco_mode',
    'child_lock',
    'fan_swing_vertical',
    'fan_swing_horizontal',
    'legacy_fan_speed',
  ],
  boolean_capability_trigger: ['open_window_sensor'],
} as const;

export type HomeyThermostatSettings = {
  target_temperature_scaling: ScaledProperty;
  measure_temperature_scaling: ScaledProperty;
  measure_humidity_scaling: ScaledProperty;
  measure_power_scaling: ScaledProperty;
  capacity_set: '2000W' | '3000W' | '5000W';
  temp_correction: number;
  sensor_choose: 'in' | 'out';
  backlight: number;
  backlight_enum: 'closed' | 'half_bright' | 'full_bright';
  window_check: boolean;
};

export type TuyaThermostatSettings = {
  capacity_set: '2000W' | '3000W' | '5000W';
  temp_correction: number;
  sensor_choose: 'in' | 'out';
  backlight: number;
  backlight_enum: 'closed' | 'half_bright' | 'full_bright';
  window_check: boolean;
};

export const THERMOSTAT_SETTING_LABELS = TRANSLATIONS.setting_labels;
