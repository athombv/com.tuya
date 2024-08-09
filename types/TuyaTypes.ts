export type TuyaCommand = {
  code: string,
  value: unknown,
}

export type TuyaStatus = Record<string, unknown>

export type TuyaStatusUpdate<T> = {
  code: string
  value: T
  t: number
  [datapoint: string]: any // Seems to be datapoint index as string to value as string
}

export type TuyaScene = {
  id: string
  name: string
  running_mode: 'local' | 'lan' | 'cloud'
  space_id: string
  status: 'enable' | 'disable'
  type: 'scene' | 'automation' // tap-to-run or automation
}
