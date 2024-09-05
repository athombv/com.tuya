/** capabilities that map one to one to a Homey capability */
export const CLIMATE_SENSOR_CAPABILITIES = {
  read_write: ['switch'],
  read_only: ['temper_alarm'],
  read_only_scaled: ['va_temperature', 'va_humidity', 'bright_value'],
  setting: [],
} as const;

export const CLIMATE_CAPABILITY_MAPPING = {
  switch: 'onoff',
  va_temperature: 'measure_temperature',
  va_humidity: 'measure_humidity',
  bright_value: 'measure_luminance',
  battery_value: 'measure_battery',
  va_battery: 'measure_battery',
} as const;

export const CLIMATE_SENSOR_SETTING_LABELS = {
  va_temperature_scaling: 'Measured Temperature Scale',
  va_humidity_scaling: 'Measured Humidity Scale',
  bright_value_scaling: 'Measured Brightness Scale',
  use_alarm_timeout: 'Use Alarm Timeout',
  alarm_timeout: 'Alarm Timeout',
} as const;

export type HomeyClimateSensorSettings = {
  va_temperature_scaling: '0' | '1' | '2' | '3';
  va_humidity_scaling: '0' | '1' | '2' | '3';
  bright_value_scaling: '0' | '1' | '2' | '3';
  use_alarm_timeout: boolean;
  alarm_timeout: number;
};

export type TuyaClimateSensorSettings = Record<string, never>;
