export const IRRIGATOR_CAPABILITIES_MAPPING = {
  switch: 'onoff',
  temp_current: 'measure_temperature',
  va_temperature: 'measure_temperature',
  humidity_current: 'measure_humidity',
  va_humidity: 'measure_humidity',
  water_current: 'measure_water',
  rain_sensor_state: 'rain_sensor',
  battery_percentage: 'measure_battery',
  rain_battery_percentage: 'measure_battery.rain_sensor',
  temp_hum_battery_percentage: 'measure_battery.climate_sensor',
  water_total: 'meter_water',
} as const;

export const IRRIGATOR_CAPABILITIES = {
  read_write: ['switch'],
  read_only_scaled: [
    'temp_current',
    'va_temperature',
    'humidity_current',
    'va_humidity',
    'water_current',
    'water_total',
  ],
  read_only: ['battery_percentage', 'rain_battery_percentage', 'temp_hum_battery_percentage'],
} as const;

export type HomeyIrrigatorSettings = {
  measure_temperature_scaling: '0' | '1' | '2' | '3';
  measure_humidity_scaling: '0' | '1' | '2' | '3';
  measure_water_scaling: '0' | '1' | '2' | '3';
  meter_water_scaling: '0' | '1' | '2' | '3';
};

export type TuyaIrrigatorSettings = never;
