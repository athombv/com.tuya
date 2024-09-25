import { HomeySensorSettings, TuyaSensorSettings } from '../../lib/sensor/TuyaSensorConstants';
import { ScaledProperty } from '../../types/TuyaTypes';

export const SENSOR_PM25_CAPABILITY_MAPPING = {
  pm25_state: 'alarm_pm25',
  pm25_value: 'measure_pm25', // μg/m³
  ch2o_value: 'measure_ch2o', // ppm
  voc_value: 'measure_tvoc', // ppm
  co2_value: 'measure_co2', // ppm
  pm1: 'measure_pm1', // μg/m³
  pm10: 'measure_pm10', // μg/m³
  temp_current: 'measure_temperature',
  humidity_value: 'measure_humidity',
} as const;

export const SENSOR_PM25_CAPABILITIES = {
  read_only: ['pm25_value', 'ch2o_value', 'voc_value', 'co2_value', 'pm1', 'pm10'],
  read_only_scaled: ['temp_current', 'humidity_value'],
} as const;

export type HomeyPM25SensorSettings = {
  measure_temperature_scaling: ScaledProperty;
  measure_humidity_scaling: ScaledProperty;
} & HomeySensorSettings;

export type TuyaPM25SensorSettings = TuyaSensorSettings;
