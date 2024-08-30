export const HEATER_CAPABILITIES_MAPPING = {
  /* Large and small appliances */
  switch: 'onoff',
  temp_set: 'target_temperature',
  temp_current: 'measure_temperature',

  /* small appliances */
  lock: 'child_lock',
  work_power: 'measure_power',
  mode_eco: 'eco_mode',

  /* large appliances */
  child_lock: 'child_lock',
  eco: 'eco_mode',
  fault: 'fault',
} as const;

export type HomeyHeaterSettings = {
  temp_set_scaling: '0' | '1' | '2' | '3';
  temp_current_scaling: '0' | '1' | '2' | '3';
  work_power_scaling: '0' | '1' | '2' | '3';
};

export type TuyaHeaterSettings = Record<string, never>;

export const DEFAULT_TUYA_HEATER_FAULTS = [
  'sys_high_fault',
  'sys_low_fault',
  'flow_fault',
  'power_fault',
  'cooling_fault',
  'heating_fault',
  'temp_dif_fault',
  'in_temp_fault',
  'eff_temp_fault',
  'coil_temp_fault',
  'ret_temp_fault',
  'news_fault',
  'amb_temp_fault',
  'lack_water',
  'serious_fault',
  'sensor_fault',
  'motor_fault',
];
