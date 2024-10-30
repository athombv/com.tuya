type TuyaUserProperty = {
  code: string;
  value: string;
};

export type TuyaUserInfo = {
  create_time: number;
  user_properties: TuyaUserProperty[];
  mobile: string;
  avatar: string;
  country_code: number;
  uid: string;
  update_time: number;
  nick_name: string;
  time_zone_id: string;
  email: string;
  temp_unit: number;
  username: string;
};

export type TuyaToken = {
  expire_time: number;
  access_token: string;
  uid: string;
  refresh_token: string;
};
export type TuyaCommand = {
  code: string;
  value: unknown;
};
export type TuyaScene = {
  id: string;
  name: string;
  running_mode: 'local' | 'lan' | 'cloud';
  space_id: string;
  status: 'enable' | 'disable';
  type: 'scene' | 'automation'; // tap-to-run or automation
};

export type TuyaScenesResponse = {
  has_more: boolean;
  list: TuyaScene[];
  total: number;
};

export type TuyaHome = {
  geo_name: string;
  home_id: number;
  lat: number;
  lon: number;
  name: string;
  role: string;
};

type TuyaStatusDatum<T> = {
  code: string;
  value: T;
};

export type TuyaStatusResponse = TuyaStatusDatum<unknown>[];

export type TuyaDeviceResponse = {
  active_time: number;
  biz_type: number;
  category: string;
  create_time: number;
  icon: string;
  id: string;
  ip: string;
  local_key: string;
  name: string;
  online: boolean;
  owner_id: string;
  product_id: string;
  product_name: string;
  status: TuyaStatusResponse;
  sub: boolean;
  time_zone: string;
  uid: string;
  update_time: number;
  uuid: string;
};

type TuyaSpecificationDatum = {
  code: string;
  type: string;
  values: string;
};

export type TuyaDeviceSpecificationResponse = {
  category: string;
  functions?: TuyaSpecificationDatum[];
  status?: TuyaSpecificationDatum[];
};

export type TuyaDeviceDataPointResponse = {
  properties: Array<TuyaDeviceDataPoint>;
};

export type TuyaDeviceDataPoint = {
  code: string;
  custom_name: string;
  dp_id: number;
  time: number;
  type: string;
  value: unknown;
};

type TuyaWebRTCIce = {
  ttl?: number;
  urls: string;
  credential?: string;
  username?: string;
};

export type TuyaWebRTC = {
  p2p_config: {
    ices: TuyaWebRTCIce[];
  };
  auth: string;
  supports_webrtc: true;
  skill: string;
  moto_id: string;
  id: string;
  vedio_clarity: number;
  audio_attributes: {
    call_mode: number[];
    hardware_capability: number[];
  };
};

// Ir Remotes
export type TuyaIrRemoteResponse = {
  area_id: number; // 0 if undefined
  area_name?: string;
  brand_id: number;
  brand_name: string;
  category_id: number;
  operator_id: number; // 0 if undefined
  operator_name?: string;
  remote_id: string;
  remote_index: number;
  remote_name: string;
};

export type TuyaIrRemoteKeysResponse = {
  brand_id: number;
  category_id: number;
  remote_index: number;
  single_air: boolean; // 	Boolean 	Indicates whether it is a unitary air conditioner.
  duplicate_power: boolean; // 	Boolean 	Indicates whether the power-on button is the same as the power-off button.
  key_list: TuyaIrRemoteKey[]; //	List 	The list of keys.
  key_range: TuyaIrRemoteRange[]; // 	List 	The range of keys.
};

export type TuyaIrRemoteKey = {
  key: string; // 	String 	The key.
  key_id: number; // 	Integer 	The key ID.
  key_name: string; // 	String 	The name of a specified key.
  standard_key: boolean; // 	Boolean 	Indicates whether it is a standard key.
};

export type TuyaIrRemoteRange = {
  mode: TuyaIrRemoteRangeMode;
  mode_name: string;
  temp_list: TuyaIrRemoteRangeTemp[];
};

export const enum TuyaIrRemoteRangeMode {
  cooling = 0,
  heating = 1,
  automatic = 2,
  air_supply = 3,
  dehumidification = 4,
}

export type TuyaIrRemoteRangeTemp = {
  temp: number; // 	Integer 	The temperature.
  temp_name: string; // 	String 	The temperature name.
  fan_list: TuyaIrRemoteRangeTempFan[]; // 	Set 	The value range of the wind speed.
};

export type TuyaIrRemoteRangeTempFan = {
  fan: TuyaIrRemoteRangeTempFanSpeed; // Speed
  fan_name: string; // Speed name
};

export const enum TuyaIrRemoteRangeTempFanSpeed {
  automatic = 0,
  low = 1,
  medium = 2,
  high = 3,
}
