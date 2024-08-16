export const HEATER_CAPABILITIES_MAPPING = {
  switch: 'onoff',
  temp_set: 'target_temperature',
  temp_current: 'measure_temperature',
  lock: 'child_lock',
  work_power: 'measure_power',
  mode_eco: 'eco_mode',
} as const;

export type HomeySocketSettings = {
  temp_set_scaling: '0' | '1' | '2' | '3';
  temp_current_scaling: '0' | '1' | '2' | '3';
  work_power_scaling: '0' | '1' | '2' | '3';
};

export type TuyaSocketSettings = Record<string, never>;
