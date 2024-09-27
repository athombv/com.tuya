import TRANSLATIONS from './translations.json';

export type HomeySensorSettings = {
  use_alarm_timeout: boolean;
  alarm_timeout: number;
  muffling: boolean;
  alarm_volume: 'low' | 'middle' | 'high' | 'mute';
  alarm_time: number;
  alarm_ringtone: '1' | '2' | '3' | '4' | '5';
  alarm_bright: number;
};

export type TuyaSensorSettings = {
  muffling: boolean;
  alarm_volume: 'low' | 'middle' | 'high' | 'mute';
  alarm_time: number;
  alarm_ringtone: '1' | '2' | '3' | '4' | '5';
  alarm_bright: number;
};

export const SENSOR_CAPABILITY_MAPPING = {
  battery_state: 'alarm_battery',
  battery_value: 'measure_battery',
  battery_percentage: 'measure_battery',
  temper_alarm: 'alarm_tamper',
  alarm_switch: 'onoff.alarm_switch',
};

export const SENSOR_CAPABILITIES = {
  setting: ['muffling', 'alarm_volume', 'alarm_time', 'alarm_ringtone', 'alarm_bright'],
} as const;

export const SENSOR_SETTING_LABELS = TRANSLATIONS.setting_labels;
