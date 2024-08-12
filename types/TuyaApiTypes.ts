type TuyaUserProperty = {
  "code": string,
  "value": string
};

export type TuyaUserInfo = {
  "create_time": number,
  "user_properties": TuyaUserProperty[],
  "mobile": string,
  "avatar": string,
  "country_code": number,
  "uid": string,
  "update_time": number,
  "nick_name": string,
  "time_zone_id": string,
  "email": string,
  "temp_unit": number,
  "username": string,
}

export type TuyaToken = {
  "expire_time": number,
  "access_token": string,
  "uid": string,
  "refresh_token": string,
}
export type TuyaCommand = {
  code: string,
  value: unknown,
}
export type TuyaScene = {
  id: string
  name: string
  running_mode: 'local' | 'lan' | 'cloud'
  space_id: string
  status: 'enable' | 'disable'
  type: 'scene' | 'automation' // tap-to-run or automation
}
