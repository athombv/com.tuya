export type TuyaStatus = Record<string, unknown>

export type TuyaStatusUpdate<T> = {
  code: string
  value: T
  t: number
  [datapoint: string]: any // Seems to be datapoint index as string to value as string
}

export type DeviceRegistration = {
  productId: string,
  deviceId: string,
  onStatus: (status: TuyaStatus) => Promise<void>,
  onOnline: () => Promise<void>,
  onOffline: () => Promise<void>,
}
