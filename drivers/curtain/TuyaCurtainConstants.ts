export const CURTAIN_CAPABILITY_MAPPING = {
  control: 'windowcoverings_state',
  mach_operate: 'windowcoverings_state',
  position: 'windowcoverings_set',
  percent_control: 'windowcoverings_set',
  percent_state: 'windowcoverings_set',
} as const;

export const CURTAIN_CAPABILITIES = {
  read_write: ['control', 'position', 'mach_operate', 'percent_control'],
  setting: ['opposite', 'control_back'],
} as const;

export type HomeyCurtainSettings = {
  inverse: boolean;
};

export type TuyaCurtainSettings = {
  opposite: boolean; // inverse
  control_back: boolean; // inverse
  control_back_mode: 'forward' | 'back'; // inverse
};

export const CURTAIN_SETTING_LABELS = {
  opposite: 'Inverse direction',
  control_back: 'Inverse direction',
  control_back_mode: 'Inverse direction',
};
