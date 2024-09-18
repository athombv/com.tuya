export const API_URL = {
  EU: process.env.TUYA_API_URL_EU ?? 'https://openapi.tuyaeu.com',
  US: process.env.TUYA_API_URL_US ?? 'https://openapi.tuyaus.com',
  IN: process.env.TUYA_API_URL_IN ?? 'https://openapi.tuyain.com',
  CN: process.env.TUYA_API_URL_CN ?? 'https://openapi.tuyacn.com',
};

export type RegionCode = keyof typeof API_URL;

export const GRANT_TYPE = {
  SIMPLE: '1',
  OAUTH2: '2',
} as const;

/** See {@link https://developer.tuya.com/en/docs/iot/standarddescription?id=K9i5ql6waswzq} */
export const DEVICE_CATEGORIES = {
  LIGHTING: {
    LIGHT: 'dj',
    CEILING_LIGHT: 'xdd',
    AMBIENCE_LIGHT: 'fwd',
    STRING_LIGHT: 'dc',
    STRIP_LIGHT: 'dd',
    MOTION_SENS_LIGHT: 'gyd',
    CEILING_FAN_LIGHT: 'fsd',
    SOLAR_LIGHT: 'tyndj',
    DIMMER: 'tgq',
    REMOTE_CONTROL: 'ykg',
  },
  ELECTRICAL_PRODUCTS: {
    SWITCH: 'kg',
    SOCKET: 'cz',
    POWER_STRIP: 'pc',
    SCENE_SWITCH: 'cjkg',
    CARD_SWITCH: 'ckqdkg',
    CURTAIN_SWITCH: 'clkg',
    GARAGE_DOOR_OPEN: 'ckmkzq',
    DIMMER_SWITCH: 'tgkg',
    WIRELESS_SWITCH: 'wxkg',
  },
  LARGE_HOME_APPLIANCES: {
    HEATER: 'rs',
    VENT_SYSTEM: 'xfj',
    REFRIGERATOR: 'bx',
    BATHTUB: 'yg',
    WASHING_MACHINE: 'xy',
    AIR_CONDITIONER: 'kt',
    AIR_CONDITIONER_CONTROLLER: 'ktkzq',
    BOILER: 'bgl',
  },
  SMALL_HOME_APPLIANCES: {
    ROBOT_VACUUM: 'sd',
    HEATER: 'qn',
    AIR_PURIFIER: 'kj',
    DRYING_RACK: 'lyj',
    DIFFUSER: 'xxj',
    CURTAIN: 'cl',
    DOOR_WINDOW_CONTROLLER: 'mc',
    THERMOSTAT: 'wk',
    BATHROOM_HEATER: 'yb',
    IRRIGATOR: 'ggq',
    HUMIDIFIER: 'jsq',
    DEFUMIDIFIER: 'cs',
    FAN: 'fs',
    WATER_PURIFIER: 'js',
    ELECTRIC_BLANKET: 'dr',
    PET_TREAT_FEEDER: 'cwtswsq',
    PET_BALL_THROWER: 'cwwqfsq',
    HVAC: 'ntq',
    PET_FEEDER: 'cwwsq',
    PET_FOUNTAIN: 'cwysj',
    SOFA: 'sf',
    ELECTRIC_FIREPLACE: 'dbl',
    SMART_MILK_KETTLE: 'tnq',
    CAT_TOILET: 'msp',
    TOWEL_RACK: 'mjj',
    SMART_INDOOR_GARDEN: 'sz',
  },
  KITCHEN_APPLIANCES: {
    SMART_kETTLE: 'bh',
    BREAD_MAKER: 'mb',
    COFFEE_MAKER: 'kfj',
    BOTTLE_WARMER: 'nnq',
    MILK_DISPENSER: 'cn',
    SOUS_VIDE_COOKER: 'mzj',
    RICE_CABINET: 'mg',
    INDUCTION_COOKER: 'dcl',
    AIR_FRYER: 'kqzg',
    BENTO_BOX: 'znfh',
  },
  SECURITY_VIDEO_SURV: {
    ALARM_HOST: 'mal',
    SMART_CAMERA: 'sp',
    SIREN_ALARM: 'sgbj',
    VIBRATION_SENSOR: 'zd',
    CONTACT_SENSOR: 'mcs',
    GAS_ALARM: 'rqbj',
    SMOKE_ALARM: 'ywbj',
    TEMP_HUMI_SENSOR: 'wsdcg',
    WATER_DETECTOR: 'sj',
    PRESSURE_SENSOR: 'ylcg',
    LUMINANCE_SENSOR: 'ldcg',
    EMERGENCY_BUTTON: 'sos',
    PM25_DETECTOR: 'pm25',
    MOTION_SENSOR: 'pir',
    CO_DETECTOR: 'cobj',
    CO2_DETECTOR: 'co2bj',
    MULTI_FUNC_SENSOR: 'dgnbj',
    METHANE_DETECTOR: 'jwbj',
    PRESENCE_DETECTOR: 'hps',
    // SMART_LOCK
  },
  EXERCISE_HEALTH: {
    MASSAGE_CHAIR: 'amy',
    PHYSIO_PRODUCTS: 'liliao',
    SMART_JUMP_ROPE: 'ts',
    BODY_FAT_SCALE: 'tzc1',
    SMART_WATCH_FITNESS_TRACK: 'sb',
    SMART_PILL_BOX: 'znyh',
  },
  ENERGY: {
    SMART_ELECTRIC_METER: 'zndb',
    SMART_WATER_METER: 'znsb',
    CIRCUIT_BREAKER: 'dlq',
  },
  DIGITAL_ENTERTAINMENT: {
    TV: 'ds',
    PROJECTOR: 'tyy',
    // OUTDOOR_TRAVEL
  },
} as const;

// https://developer.tuya.com/en/docs/iot/error-code?id=K989ruxx88swc
export const ERROR_CODES = {
  SYS_ERROR: 500, // it is a system error, please contact the admin for troubleshooting
  DATA_NOT_EXIST: 1000, // The data does not exist
  SECRET_INVALID: 1001, // The secret is invalid
  ACCESS_TOKEN_NULL: 1002, // the token is null
  GRANT_TYPE_INVALID: 1003, // the authorization type is invalid
  SIGN_INVALID: 1004, // the signature is invalid
  CLIENT_ID_INVALID: 1005, // the value of clientid is invalid
  CONTENT_TYPE_NOT_SUPPORTED: 1006, // the content type is not supported
  KEY_NOT_SUPPORTED: 1007, // the key is not supported
  ACCESS_ID_INVALID: 1008, // the value of accessid is invalid
  ACCESS_TOKEN_EXPIRED: 1010, // the token has expired
  ACCESS_TOKEN_INVALID: 1011, // the token is invalid
  ACESS_TOKEN_STATUS_INVALID: 1012, // the token its status is invalid
  REQUEST_TIME_INVALID: 1013, // the request timestamp has expired
  PARAM_EMPTY: 1100, // the specified parameters are empty
  PARAM_RANGE_INVALID: 1101, // the parameter range is invalid
  PARAM_NULL: 1102, // the parameter is null
  COMMAND_INVALID: 1103, // specified command is invalid
  TYPE_INCORRECT: 1104, // the type is incorrect
  HEADER_MISSING: 1105, // the header is missing
  PERMISSION_DENIED: 1106, // the permission request is denied
  CODE_INVALID: 1107, // the authorization code is invalid
  URI_VALUE_INVALID: 1108, // the value of uri is invalid, please check it
  PARAM_ILLEGAL: 1109, // the parameter is illegal, please check it
  CONCURRENT_REQUESTS_LIMIT: 1110, // the number of concurrent requests exceeds the upper limit
  SYS_BUSY: 1111, // the system is busy, try again later
  USER_SYNC_BG: 1112, // the user is synchronizing data in the background, try again later
  SYS_REPEAT_ERROR: 1113, // do not repeat this operation in a short period of time
  SYS_REQUEST_FREQ: 1199, // your requests are too frequent, please wait
  TOKEN_INVALID: 1400, // the token is invalid
  DEVICE_OFFLINE: 2001, // the device is offline
  USER_NO_DEVICES: 2002, // the user does not have any devices
  FUNCTION_NOT_SUPPORTED: 2003, // this specified function is not supported
  LOCK_TYPE_NOT_SUPPORTED: 2004, // this lock type is not supported
  PRODUCT_NOT_EXIST: 2005, // the specified product does not exist
  USER_NOT_EXIST: 2006, // the specified user does not exist
  DEVICE_TOKEN_EXPIRED: 2007, // the device token has expired
  COM_VAL_NOT_SUPPORTED: 2008, // the command or value is not supported
  DEVICE_TYPE_NOT_SUPPORTED: 2009, // this type of device is not supported
  DEVICE_NOT_EXIST: 2010, // the specified device does not exist
  APPLICATION_NOT_SUPPORTED: 2012, // the application is not supported
  TIMER_ADD_FAILED: 2013, // it failed to add a timer / scheduled task
  DEVICE_NO_TIMERS: 2014, // this device does not have any timers / scheduled tasks
  CAT_NOT_SUPPORTED: 2015, // this category is not supported
  REMOTECTRL_REMOVED: 2016, // the remote control is removed or it does not exist
  SCHEMA_NOT_EXIST: 2017, // the schema does not exist
  DATA_DECRYPT_FAILED: 2018, // it failed to decrypt the data
  PERIOD_TWO_HOURS: 2019, // the period is more than two hours
  THIRD_PARTY_ONLY: 2020, // only third party clouds are supported
  EMAIL_INCORRECT: 2021, // this email adress is incorrect
  PHONE_INCORRECT: 2022, // this phone number is incorrect
  USER_EXIST: 2023, // this user already exists
  DEVICE_PATH_INVALID: 2024, // the device path is invalid
  DEVICE_FILE_PATH_NOMATCH: 2025, // the device and file path are not equal or do not match
  IP_ADDRESS_FAILED: 2026, // failed to get the IP address
  SIZE_TOO_LARGE: 2027, // the file size is too large
  ENCRYPT_TOKEN_EXPIRE: 2028, // the token has expired
  SESSION_STATUS_INVALID: 2029, // the session status is invalid
  VIRTUAL_SCAN_NOT_SUPPORTED: 2030, // virtual scanning not supported, this is currently only available in Chinese Data Center
  THIRD_PARTY_AUTH_FAILED: 2031, // the third party authorization failed
  REQUEST_ID_EXIST: 2032, // this request_id already exists. Request_ids need to be unique
  USER_PUSH_MESSAGE_LIMIT: 2033, // the number of users who receive the app push messages exceeded 1000.
  USERNAME_BOUND_TYPE: 2037, // this username has been bound by another username type
  OPERATOR_EXIST: 2041, // this operator name already exists
  OPERATOR_NOT_EXIST: 2042, // this operator name does not exist
  OPERATOR_UUID_NOT_EXIST: 2043, // the operator's UUID does not exist
  OPERATOR_IP_NOT_EXIST: 2044, // the operator's IP address does not exist
  OPERATOR_IP_BOUND: 2045, // the operator's IP address has already been bound
  OPERATOR_UUID_BOUND: 2046, // the operator's UUID has already been bound
  DEVICE_FROZEN: 2047, // this device has been frozen by a user and cannot be commanded
  IR_CODE_KEY_NOT_EXIST: 2050, // the infrared code corresponding to the key does not exist (the specified IR code does not exist)
  IR_COMMAND_FAILED: 2051, // the IR command failed to send
  TEMPERATURE_SET_COMMAND_NOT_SUPPORTED: 2052, // the command to set a specified temperature is not supported
  IR_CODE_INVALID: 2053, // the IR code is invalid, it does not match
  SUB_DEVICE_NOT_EXIST: 2054, // the sub device does not exist
  DEVICE_NOT_SUPPORTED: 2055, // this device is not supported
  DEVICE_BOUND_OR_INACTIVE: 2056, // the device has already been bound or it is inactive
  USER_ADD_FAILED: 2060, // the system failed to add a user, please try again
  MESSAGE_PUSH_CONFIG_INCOMPLETE: 2061, // the push notification configuration has not been set
  DATA_EXIST: 2062, // this data already exists
  ZIGBEE_DEVICE_UPDATING: 2063, // another Zigbee device is being updated, please wait
  DEVICE_VERSION_UPTODATE: 2064, // the device version is up-to-date
  DEVICE_NAME_EXIST: 2101, // this device name already exists
} as const;

// From (0,100) in Homey to (0,1000) in Tuya
export const TUYA_PERCENTAGE_SCALING = 10 as const;
