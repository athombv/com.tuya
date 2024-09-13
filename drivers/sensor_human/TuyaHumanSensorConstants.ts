export const HUMAN_SENSOR_CAPABILITIES = {
  setting: ['sensitivity', 'near_detection', 'far_detection'],
} as const;

export const HUMAN_SENSOR_FLOWS = {
  setting: ['sensitivity', 'near_detection', 'far_detection'],
} as const;

export type HomeyHumanSensorSettings = {
  sensitivity: number;
  near_detection: number;
  far_detection: number;
  use_alarm_timeout: boolean;
  alarm_timeout: number;
};

export type TuyaHumanSensorSettings = {
  sensitivity: number;
  near_detection: number;
  far_detection: number;
};

export const HUMAN_SENSOR_SETTING_LABELS = {
  sensitivity: 'Sensitivity',
  near_detection: 'Nearest detection distance',
  far_detection: 'Furthest detection distance',
} as const;
