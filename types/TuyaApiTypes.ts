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
