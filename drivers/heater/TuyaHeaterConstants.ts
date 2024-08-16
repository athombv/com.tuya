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
