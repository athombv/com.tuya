'use strict';

/**
 * See {@link https://developer.tuya.com/en/docs/iot/datatypedescription?id=K9i5ql2jo7j1k}
 * @hideconstructor
 */
class TuyaOAuth2Constants {

  static GRANT_TYPE = {
    SIMPLE: '1',
    OAUTH2: '2',
  };

  static DEVICE_CATEGORIES = {
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
      // CIRCUIT_BREAKER
    },
    DIGITAL_ENTERTAINMENT: {
      TV: 'ds',
      PROJECTOR: 'tyy',
      // OUTDOOR_TRAVEL
    },
  };

  // https://developer.tuya.com/en/docs/iot/error-code?id=K989ruxx88swc
  static ERROR_CODES = {
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
  };

  // Light
  // Source: https://developer.tuya.com/en/docs/iot/dj?id=K9i5ql3v98hn3
  static LIGHT_COLOUR_DATA_V1_HUE_MIN = 0;
  static LIGHT_COLOUR_DATA_V1_HUE_MAX = 360;
  static LIGHT_COLOUR_DATA_V1_SATURATION_MIN = 0;
  static LIGHT_COLOUR_DATA_V1_SATURATION_MAX = 255;
  static LIGHT_COLOUR_DATA_V1_VALUE_MIN = 0;
  static LIGHT_COLOUR_DATA_V1_VALUE_MAX = 255;

  static LIGHT_COLOUR_DATA_V2_HUE_MIN = 0;
  static LIGHT_COLOUR_DATA_V2_HUE_MAX = 360;
  static LIGHT_COLOUR_DATA_V2_SATURATION_MIN = 0;
  static LIGHT_COLOUR_DATA_V2_SATURATION_MAX = 1000;
  static LIGHT_COLOUR_DATA_V2_VALUE_MIN = 0;
  static LIGHT_COLOUR_DATA_V2_VALUE_MAX = 1000;

  static LIGHT_TEMP_VALUE_V1_MIN = 25;
  static LIGHT_TEMP_VALUE_V1_MAX = 255;

  static LIGHT_TEMP_VALUE_V2_MIN = 0;
  static LIGHT_TEMP_VALUE_V2_MAX = 1000;

  static LIGHT_BRIGHT_VALUE_V1_MIN = 25;
  static LIGHT_BRIGHT_VALUE_V1_MAX = 255;

  static LIGHT_BRIGHT_VALUE_V2_MIN = 10;
  static LIGHT_BRIGHT_VALUE_V2_MAX = 1000;

  // Datacenter
  // Source: https://developer.tuya.com/en/docs/iot/oem-app-data-center-distributed?id=Kafi0ku9l07qb
  static DATACENTERS = {
    EU: 'eu',
    US: 'us',
    IN: 'in',
    CN: 'cn',
  };

  static COUNTRY_DATACENTER_MAP = {
    // Central Europe Data Center
    RU: this.DATACENTERS.EU,
    EG: this.DATACENTERS.EU,
    ZA: this.DATACENTERS.EU,
    GR: this.DATACENTERS.EU,
    NL: this.DATACENTERS.EU,
    BE: this.DATACENTERS.EU,
    FR: this.DATACENTERS.EU,
    ES: this.DATACENTERS.EU,
    HU: this.DATACENTERS.EU,
    IT: this.DATACENTERS.EU,
    RO: this.DATACENTERS.EU,
    CH: this.DATACENTERS.EU,
    AT: this.DATACENTERS.EU,
    GB: this.DATACENTERS.EU,
    DK: this.DATACENTERS.EU,
    SE: this.DATACENTERS.EU,
    NO: this.DATACENTERS.EU,
    PL: this.DATACENTERS.EU,
    DE: this.DATACENTERS.EU,
    AU: this.DATACENTERS.EU,
    SG: this.DATACENTERS.EU,
    TR: this.DATACENTERS.EU,
    PK: this.DATACENTERS.EU,
    AF: this.DATACENTERS.EU,
    LK: this.DATACENTERS.EU,
    MA: this.DATACENTERS.EU,
    DZ: this.DATACENTERS.EU,
    TN: this.DATACENTERS.EU,
    LY: this.DATACENTERS.EU,
    GM: this.DATACENTERS.EU,
    SN: this.DATACENTERS.EU,
    MR: this.DATACENTERS.EU,
    ML: this.DATACENTERS.EU,
    GN: this.DATACENTERS.EU,
    CI: this.DATACENTERS.EU,
    BF: this.DATACENTERS.EU,
    NE: this.DATACENTERS.EU,
    TG: this.DATACENTERS.EU,
    BJ: this.DATACENTERS.EU,
    MU: this.DATACENTERS.EU,
    LR: this.DATACENTERS.EU,
    SL: this.DATACENTERS.EU,
    GH: this.DATACENTERS.EU,
    NG: this.DATACENTERS.EU,
    TD: this.DATACENTERS.EU,
    CF: this.DATACENTERS.EU,
    CM: this.DATACENTERS.EU,
    CV: this.DATACENTERS.EU,
    GQ: this.DATACENTERS.EU,
    GA: this.DATACENTERS.EU,
    CG: this.DATACENTERS.EU,
    CD: this.DATACENTERS.EU,
    AO: this.DATACENTERS.EU,
    SC: this.DATACENTERS.EU,
    RW: this.DATACENTERS.EU,
    ET: this.DATACENTERS.EU,
    SO: this.DATACENTERS.EU,
    DJ: this.DATACENTERS.EU,
    KE: this.DATACENTERS.EU,
    TZ: this.DATACENTERS.EU,
    UG: this.DATACENTERS.EU,
    BI: this.DATACENTERS.EU,
    MZ: this.DATACENTERS.EU,
    ZM: this.DATACENTERS.EU,
    MG: this.DATACENTERS.EU,
    YT: this.DATACENTERS.EU,
    ZW: this.DATACENTERS.EU,
    NA: this.DATACENTERS.EU,
    MW: this.DATACENTERS.EU,
    LS: this.DATACENTERS.EU,
    BW: this.DATACENTERS.EU,
    SZ: this.DATACENTERS.EU,
    KM: this.DATACENTERS.EU,
    ER: this.DATACENTERS.EU,
    AW: this.DATACENTERS.EU,
    FO: this.DATACENTERS.EU,
    GL: this.DATACENTERS.EU,
    GI: this.DATACENTERS.EU,
    PT: this.DATACENTERS.EU,
    LU: this.DATACENTERS.EU,
    IE: this.DATACENTERS.EU,
    IS: this.DATACENTERS.EU,
    AL: this.DATACENTERS.EU,
    MT: this.DATACENTERS.EU,
    CY: this.DATACENTERS.EU,
    FI: this.DATACENTERS.EU,
    BG: this.DATACENTERS.EU,
    LT: this.DATACENTERS.EU,
    LV: this.DATACENTERS.EU,
    EE: this.DATACENTERS.EU,
    MD: this.DATACENTERS.EU,
    AM: this.DATACENTERS.EU,
    BY: this.DATACENTERS.EU,
    AD: this.DATACENTERS.EU,
    MC: this.DATACENTERS.EU,
    SM: this.DATACENTERS.EU,
    VA: this.DATACENTERS.EU,
    UA: this.DATACENTERS.EU,
    RS: this.DATACENTERS.EU,
    ME: this.DATACENTERS.EU,
    HR: this.DATACENTERS.EU,
    SI: this.DATACENTERS.EU,
    BA: this.DATACENTERS.EU,
    MK: this.DATACENTERS.EU,
    CZ: this.DATACENTERS.EU,
    SK: this.DATACENTERS.EU,
    LI: this.DATACENTERS.EU,
    BZ: this.DATACENTERS.EU,
    SV: this.DATACENTERS.EU,
    HN: this.DATACENTERS.EU,
    NI: this.DATACENTERS.EU,
    CR: this.DATACENTERS.EU,
    PA: this.DATACENTERS.EU,
    PM: this.DATACENTERS.EU,
    HT: this.DATACENTERS.EU,
    MF: this.DATACENTERS.EU,
    GY: this.DATACENTERS.EU,
    MQ: this.DATACENTERS.EU,
    BN: this.DATACENTERS.EU,
    TO: this.DATACENTERS.EU,
    FJ: this.DATACENTERS.EU,
    PW: this.DATACENTERS.EU,
    WF: this.DATACENTERS.EU,
    WS: this.DATACENTERS.EU,
    NC: this.DATACENTERS.EU,
    TV: this.DATACENTERS.EU,
    PF: this.DATACENTERS.EU,
    FM: this.DATACENTERS.EU,
    MH: this.DATACENTERS.EU,
    KH: this.DATACENTERS.EU,
    LA: this.DATACENTERS.EU,
    BD: this.DATACENTERS.EU,
    MV: this.DATACENTERS.EU,
    LB: this.DATACENTERS.EU,
    JO: this.DATACENTERS.EU,
    IQ: this.DATACENTERS.EU,
    KW: this.DATACENTERS.EU,
    SA: this.DATACENTERS.EU,
    YE: this.DATACENTERS.EU,
    OM: this.DATACENTERS.EU,
    AE: this.DATACENTERS.EU,
    IL: this.DATACENTERS.EU,
    BH: this.DATACENTERS.EU,
    QA: this.DATACENTERS.EU,
    BT: this.DATACENTERS.EU,
    MN: this.DATACENTERS.EU,
    NP: this.DATACENTERS.EU,
    TJ: this.DATACENTERS.EU,
    TM: this.DATACENTERS.EU,
    AZ: this.DATACENTERS.EU,
    GE: this.DATACENTERS.EU,
    KG: this.DATACENTERS.EU,
    UZ: this.DATACENTERS.EU,
    BS: this.DATACENTERS.EU,
    BB: this.DATACENTERS.EU,
    AI: this.DATACENTERS.EU,
    AG: this.DATACENTERS.EU,
    VG: this.DATACENTERS.EU,
    VI: this.DATACENTERS.EU,
    KY: this.DATACENTERS.EU,
    BM: this.DATACENTERS.EU,
    GD: this.DATACENTERS.EU,
    TC: this.DATACENTERS.EU,
    MS: this.DATACENTERS.EU,
    MP: this.DATACENTERS.EU,
    GU: this.DATACENTERS.EU,
    AS: this.DATACENTERS.EU,
    LC: this.DATACENTERS.EU,
    DM: this.DATACENTERS.EU,
    VC: this.DATACENTERS.EU,
    TT: this.DATACENTERS.EU,
    KN: this.DATACENTERS.EU,
    JM: this.DATACENTERS.EU,

    // Western America Data Center
    US: this.DATACENTERS.US,
    CA: this.DATACENTERS.US,
    PE: this.DATACENTERS.US,
    MX: this.DATACENTERS.US,
    AR: this.DATACENTERS.US,
    BR: this.DATACENTERS.US,
    CL: this.DATACENTERS.US,
    CO: this.DATACENTERS.US,
    VE: this.DATACENTERS.US,
    MY: this.DATACENTERS.US,
    ID: this.DATACENTERS.US,
    PH: this.DATACENTERS.US,
    NZ: this.DATACENTERS.US,
    TH: this.DATACENTERS.US,
    JP: this.DATACENTERS.US,
    KR: this.DATACENTERS.US,
    VN: this.DATACENTERS.US,
    MM: this.DATACENTERS.US,
    ST: this.DATACENTERS.US,
    GW: this.DATACENTERS.US,
    IO: this.DATACENTERS.US,
    FK: this.DATACENTERS.US,
    GT: this.DATACENTERS.US,
    BO: this.DATACENTERS.US,
    EC: this.DATACENTERS.US,
    GF: this.DATACENTERS.US,
    PY: this.DATACENTERS.US,
    SR: this.DATACENTERS.US,
    UY: this.DATACENTERS.US,
    TL: this.DATACENTERS.US,
    NF: this.DATACENTERS.US,
    NR: this.DATACENTERS.US,
    PG: this.DATACENTERS.US,
    SB: this.DATACENTERS.US,
    VU: this.DATACENTERS.US,
    CK: this.DATACENTERS.US,
    NU: this.DATACENTERS.US,
    KI: this.DATACENTERS.US,
    TK: this.DATACENTERS.US,
    HK: this.DATACENTERS.US,
    MO: this.DATACENTERS.US,
    TW: this.DATACENTERS.US,
    PS: this.DATACENTERS.US,
    SX: this.DATACENTERS.US,
    PR: this.DATACENTERS.US,
    DO: this.DATACENTERS.US,
    SJ: this.DATACENTERS.US,
    CW: this.DATACENTERS.US,
    AX: this.DATACENTERS.US,

    // India Data Center
    IN: this.DATACENTERS.IN,

    // China Data Center
    CN: this.DATACENTERS.CN
  };

}

module.exports = TuyaOAuth2Constants;
