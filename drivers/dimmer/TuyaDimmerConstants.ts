import TRANSLATIONS from './translations.json';

// Map from setting id to human-readable label
export const DIMMER_SETTING_LABELS = TRANSLATIONS.setting_labels;

export const SIMPLE_DIMMER_CAPABILITIES = {
  read_write: ['switch_led_1', 'bright_value_1', 'switch_led_2', 'bright_value_2', 'switch_led_3', 'bright_value_3'],
  read_only: [],
  setting: [
    'brightness_min_1',
    'brightness_max_1',
    'brightness_min_2',
    'brightness_max_2',
    'brightness_min_3',
    'brightness_max_3',
    'led_type_1',
    'led_type_2',
    'led_type_3',
  ],
} as const;

export type HomeyDimmerSettings = {
  brightness_min_1: number;
  brightness_max_1: number;
  brightness_min_2: number;
  brightness_max_2: number;
  brightness_min_3: number;
  brightness_max_3: number;
  led_type_1: 'led' | 'incandescent' | 'halogen';
  led_type_2: 'led' | 'incandescent' | 'halogen';
  led_type_3: 'led' | 'incandescent' | 'halogen';
};

export type TuyaDimmerSettings = {
  brightness_min_1: number;
  brightness_max_1: number;
  brightness_min_2: number;
  brightness_max_2: number;
  brightness_min_3: number;
  brightness_max_3: number;
  led_type_1: 'led' | 'incandescent' | 'halogen';
  led_type_2: 'led' | 'incandescent' | 'halogen';
  led_type_3: 'led' | 'incandescent' | 'halogen';
};
