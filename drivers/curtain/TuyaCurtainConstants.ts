export const CURTAIN_CAPABILITY_MAPPING = {
  control: 'windowcoverings_state',
  mach_operate: 'windowcoverings_state',
  position: 'windowcoverings_set',
} as const;

export const CURTAIN_CAPABILITIES = {
  read_write: ['control', 'position', 'mach_operate'],
  read_only: [],
  setting: ['opposite', 'control_back', 'percent_control'],
} as const;

export type HomeyCurtainSettings = {
  inverse: boolean;
  percent_control: number;
};

export type TuyaCurtainSettings = {
  percent_control: number;
  opposite: boolean; // inverse
  control_back: boolean; // inverse
  control_back_mode: 'forward' | 'back'; // inverse
};

export const CURTAIN_SETTING_LABELS = {
  percent_control: 'Motor torque',
  opposite: 'Inverse direction',
  control_back: 'Inverse direction',
  control_back_mode: 'Inverse direction',
};
