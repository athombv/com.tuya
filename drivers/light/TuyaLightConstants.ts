import TRANSLATIONS from './translations.json';

export const PIR_CAPABILITIES = {
  read_write: [],
  read_only: ['pir_state'],
  setting: [
    'switch_pir', // Turn motion detection on/off
    'pir_delay', // change motion detection duration
    'pir_sensitivity', // Change motion detection level
    'cds', // Change luminance detection level
    'standby_time', // Change standby duration
  ],
} as const;

export const LIGHT_SETTING_LABELS = TRANSLATIONS.setting_labels;

export type LightSettingKey = keyof typeof LIGHT_SETTING_LABELS;
export type LightSettingCommand = { code: LightSettingKey; value: boolean | number };

export type HomeyLightSettings = {
  switch_pir: boolean;
  pir_sensitivity: 'low' | 'middle' | 'high';
  pir_delay: number;
  cds: '5lux' | '10lux' | '300lux' | '2000lux' | 'now';
  standby_on: boolean;
  standby_time: number;
  standby_bright: number;
};

export type TuyaLightSettings = {
  switch_pir: boolean;
  pir_sensitivity: 'low' | 'middle' | 'high';
  pir_delay: number;
  cds: '5lux' | '10lux' | '300lux' | '2000lux' | 'now';
  standby_on: boolean;
  standby_time: number;
  standby_bright: number;
};
