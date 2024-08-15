export const HEATER_CAPABILITIES_MAPPING = {
  switch: 'onoff' /* small and large appliances */,
  temp_set: 'target_temperature' /* small and large appliances */,
  temp_current: 'measure_temperature' /* small and large appliances */,
  lock: 'child_lock' /* small appliances */,
  child_lock: 'child_lock' /* large appliances */,
  work_power: 'measure_power' /* small appliances */,
  mode_eco: 'eco_mode' /* small appliances */,
  eco: 'eco_mode' /* large appliances */,
} as const;
