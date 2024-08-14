export type TuyaStatus = Record<string, unknown>;

export type TuyaStatusUpdate<T> = {
  code: string;
  value: T;
  t: number;
  [datapoint: string]: unknown; // Seems to be datapoint index as string to value as string
};

export type DeviceRegistration = {
  productId: string;
  deviceId: string;
  onStatus: (status: TuyaStatus) => Promise<void>;
  onOnline: () => Promise<void>;
  onOffline: () => Promise<void>;
};

export type SettingsEvent<T> = {
  oldSettings: T;
  newSettings: T;
  changedKeys: (keyof T)[];
};
