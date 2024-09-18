import TRANSLATIONS from './translations.json';

export const SOCKET_SETTING_LABELS = TRANSLATIONS.setting_labels;

export type HomeySocketSettings = {
  child_lock: boolean;
  relay_status: 'power_on' | 'power_off' | 'last';
  power_scaling: '0' | '1' | '2' | '3';
  cur_current_scaling: '0' | '1' | '2' | '3';
  cur_voltage_scaling: '0' | '1' | '2' | '3';
};

export type TuyaSocketSettings = {
  child_lock: boolean;
  relay_status: 'power_on' | 'power_off' | 'last' | '0' | '1' | '2';
};
