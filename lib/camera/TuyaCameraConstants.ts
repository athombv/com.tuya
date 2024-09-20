import TRANSLATIONS from './translations.json';
// Map from setting id to human-readable label
export const CAMERA_SETTING_LABELS = TRANSLATIONS.setting_labels;

// Capabilities that are simple commands/statuses
export const SIMPLE_CAMERA_CAPABILITIES = {
  read_write: ['cruise_switch', 'siren_switch'],
  read_only: [],
  setting: [
    'motion_switch',
    'decibel_switch',
    'cry_detection_switch',
    'pet_detection',
    'motion_sensitivity',
    'decibel_sensitivity',
    'basic_nightvision',
    'basic_device_volume',
    'basic_anti_flicker',
    'basic_osd',
    'basic_flip',
    'basic_indicator',
    'motion_tracking',
  ],
} as const;

// Tuya capabilities that cannot simply be added as Homey capabilities of the same name
export const COMPLEX_CAMERA_CAPABILITIES = [
  'ptz_control',
  'ptz_stop',
  'zoom_control',
  'zoom_stop',
  'initiative_message',
  'basic_private',
  'wireless_electricity',
] as const;

// Flows that can be added with the prefix 'camera_'
export const SIMPLE_CAMERA_FLOWS = {
  read_write: ['cruise_switch', 'siren_switch'],
  setting: [
    'motion_switch',
    'decibel_switch',
    'cry_detection_switch',
    'pet_detection',
    'motion_tracking',
    'basic_nightvision',
  ],
} as const;

// Map from a toggle capability to an alarm capability
export const CAMERA_ALARM_CAPABILITIES = {
  motion_switch: 'alarm_motion',
  decibel_switch: 'alarm_sound',
  cry_detection_switch: 'alarm_crying_child',
  pet_detection: 'alarm_pet',
  doorbell_active: 'hidden.doorbell',
} as const;

// Map from an event to an alarm capability
export const CAMERA_ALARM_EVENT_CAPABILITIES = {
  ipc_motion: 'alarm_motion',
  ipc_bang: 'alarm_sound',
  ipc_baby_cry: 'alarm_crying_child',
  ipc_cat: 'alarm_pet',
} as const;

export type HomeyCameraSettings = {
  motion_switch: boolean;
  motion_tracking: boolean;
  decibel_switch: boolean;
  cry_detection_switch: boolean;
  pet_detection: boolean;
  motion_sensitivity: '0' | '1' | '2';
  decibel_sensitivity: '0' | '1';
  basic_nightvision: '0' | '1' | '2';
  basic_device_volume: number;
  basic_anti_flicker: '0' | '1' | '2';
  basic_osd: boolean;
  basic_flip: boolean;
  basic_indicator: boolean;
  alarm_timeout: number;
};

export type TuyaCameraSettings = {
  motion_switch: boolean;
  motion_tracking: boolean;
  decibel_switch: boolean;
  cry_detection_switch: boolean;
  pet_detection: boolean;
  motion_sensitivity: '0' | '1' | '2';
  decibel_sensitivity: '0' | '1';
  basic_nightvision: '0' | '1' | '2';
  basic_device_volume: number;
  basic_anti_flicker: '0' | '1' | '2';
  basic_osd: boolean;
  basic_flip: boolean;
  basic_indicator: boolean;
};
