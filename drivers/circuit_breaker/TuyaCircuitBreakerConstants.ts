import TRANSLATIONS from './translations.json';

export const CIRCUIT_BREAKER_CAPABILITIES_MAPPING = {
  switch: 'onoff',
  cur_current: 'measure_current',
  cur_power: 'measure_power',
  cur_voltage: 'measure_voltage',
} as const;

export const CIRCUIT_BREAKER_CAPABILITIES = {
  read_write: ['switch'],
  read_only_scaled: ['cur_current', 'cur_power', 'cur_voltage'],
  setting: ['child_lock', 'relay_status'],
} as const;

export type HomeyCircuitBreakerSettings = {
  child_lock: boolean;
  relay_status: 'power_on' | 'power_off' | 'last';
  measure_power_scaling: '0' | '1' | '2' | '3';
  measure_current_scaling: '0' | '1' | '2' | '3';
  measure_voltage_scaling: '0' | '1' | '2' | '3';
};

export type TuyaCircuitBreakerSettings = {
  child_lock: boolean;
  relay_status: 'power_on' | 'power_off' | 'last';
};

export const CIRCUIT_BREAKER_SETTING_LABELS = TRANSLATIONS.setting_labels;
