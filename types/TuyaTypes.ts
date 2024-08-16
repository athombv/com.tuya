import type TuyaOAuth2Device from '../lib/TuyaOAuth2Device';

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

export type SettingsEvent<T extends { [key: string]: unknown }> = {
  oldSettings: T;
  newSettings: T;
  changedKeys: (keyof T)[];
};

export type StandardDeviceFlowArgs<T = TuyaOAuth2Device> = { device: T };
export type StandardValueFlowArgs<T = unknown> = { value: T };
export type StandardFlowArgs<TDevice = TuyaOAuth2Device, TValue = unknown> = StandardDeviceFlowArgs<TDevice> &
  StandardValueFlowArgs<TValue>;
