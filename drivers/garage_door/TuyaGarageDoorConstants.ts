import TRANSLATIONS from './translations.json';

export const GRAGE_DOOR_CAPABILITIES_MAPPING = {
  switch_1: 'garagedoor_closed',
  doorcontact_state: 'alarm_contact',
} as const;

export const GARAGE_DOOR_CAPABILITIES = {
  read_write: ['switch_1', 'doorcontact_state'],
  setting: ['tr_timecon'],
} as const;

export type HomeyGarageDoorSettings = {
  tr_timecon: number;
};

export type TuyaGarageDoorSettings = {
  tr_timecon: number;
};

export const GARAGE_DOOR_SETTING_LABELS = TRANSLATIONS.setting_labels;
