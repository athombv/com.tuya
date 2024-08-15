export const SOCKET_SETTING_LABELS = {
  child_lock: 'Child Lock',
  relay_status: 'Turn On Behavior',
} as const;

export type HomeySocketSettings = {
  child_lock: boolean;
  relay_status: 'power_on' | 'power_off' | 'last';
};

export type TuyaSocketSettings = {
  child_lock: boolean;
  relay_status: 'power_on' | 'power_off' | 'last' | '0' | '1' | '2';
};
