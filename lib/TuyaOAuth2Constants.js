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

  // Datacenter Regions
  // Source: https://developer.tuya.com/en/docs/iot/oem-app-data-center-distributed?id=Kafi0ku9l07qb
  static REGIONS = {
    EU: 'eu',
    US: 'us',
    IN: 'in',
    CN: 'cn',
  };

  static COUNTRIES = {
    // Central Europe Data Center
    RU: {
      region: this.REGIONS.EU,
      name: 'Russia',
      flag: '🇷🇺',
    },
    EG: {
      region: this.REGIONS.EU,
      name: 'Egypt',
      flag: '🇪🇬',
    },
    ZA: {
      region: this.REGIONS.EU,
      name: 'South Africa',
      flag: '🇿🇦',
    },
    GR: {
      region: this.REGIONS.EU,
      name: 'Greece',
      flag: '🇬🇷',
    },
    NL: {
      region: this.REGIONS.EU,
      name: 'Netherlands',
      flag: '🇳🇱',
    },
    BE: {
      region: this.REGIONS.EU,
      name: 'Belgium',
      flag: '🇧🇪',
    },
    FR: {
      region: this.REGIONS.EU,
      name: 'France',
      flag: '🇫🇷',
    },
    ES: {
      region: this.REGIONS.EU,
      name: 'Spain',
      flag: '🇪🇸',
    },
    HU: {
      region: this.REGIONS.EU,
      name: 'Hungary',
      flag: '🇭🇺',
    },
    IT: {
      region: this.REGIONS.EU,
      name: 'Italy',
      flag: '🇮🇹',
    },
    RO: {
      region: this.REGIONS.EU,
      name: 'Romania',
      flag: '🇷🇴',
    },
    CH: {
      region: this.REGIONS.EU,
      name: 'Switzerland',
      flag: '🇨🇭',
    },
    AT: {
      region: this.REGIONS.EU,
      name: 'Austria',
      flag: '🇦🇹',
    },
    GB: {
      region: this.REGIONS.EU,
      name: 'United Kingdom',
      flag: '🇬🇧',
    },
    DK: {
      region: this.REGIONS.EU,
      name: 'Denmark',
      flag: '🇩🇰',
    },
    SE: {
      region: this.REGIONS.EU,
      name: 'Sweden',
      flag: '🇸🇪',
    },
    NO: {
      region: this.REGIONS.EU,
      name: 'Norway',
      flag: '🇳🇴',
    },
    PL: {
      region: this.REGIONS.EU,
      name: 'Poland',
      flag: '🇵🇱',
    },
    DE: {
      region: this.REGIONS.EU,
      name: 'Germany',
      flag: '🇩🇪',
    },
    AU: {
      region: this.REGIONS.EU,
      name: 'Australia',
      flag: '🇦🇺',
    },
    SG: {
      region: this.REGIONS.EU,
      name: 'Singapore',
      flag: '🇸🇬',
    },
    TR: {
      region: this.REGIONS.EU,
      name: 'Turkey',
      flag: '🇹🇷',
    },
    PK: {
      region: this.REGIONS.EU,
      name: 'Pakistan',
      flag: '🇵🇰',
    },
    AF: {
      region: this.REGIONS.EU,
      name: 'Afghanistan',
      flag: '🇦🇫',
    },
    LK: {
      region: this.REGIONS.EU,
      name: 'Sri Lanka',
      flag: '🇱🇰',
    },
    MA: {
      region: this.REGIONS.EU,
      name: 'Morocco',
      flag: '🇲🇦',
    },
    DZ: {
      region: this.REGIONS.EU,
      name: 'Algeria',
      flag: '🇩🇿',
    },
    TN: {
      region: this.REGIONS.EU,
      name: 'Tunisia',
      flag: '🇹🇳',
    },
    LY: {
      region: this.REGIONS.EU,
      name: 'Libya',
      flag: '🇱🇾',
    },
    GM: {
      region: this.REGIONS.EU,
      name: 'Gambia',
      flag: '🇬🇲',
    },
    SN: {
      region: this.REGIONS.EU,
      name: 'Senegal',
      flag: '🇸🇳',
    },
    MR: {
      region: this.REGIONS.EU,
      name: 'Mauritania',
      flag: '🇲🇷',
    },
    ML: {
      region: this.REGIONS.EU,
      name: 'Mali',
      flag: '🇲🇱',
    },
    GN: {
      region: this.REGIONS.EU,
      name: 'Guinea',
      flag: '🇬🇳',
    },
    CI: {
      region: this.REGIONS.EU,
      name: 'Ivory Coast',
      flag: '🇨🇮',
    },
    BF: {
      region: this.REGIONS.EU,
      name: 'Burkina Faso',
      flag: '🇧🇫',
    },
    NE: {
      region: this.REGIONS.EU,
      name: 'Niger',
      flag: '🇳🇪',
    },
    TG: {
      region: this.REGIONS.EU,
      name: 'Togo',
      flag: '🇹🇬',
    },
    BJ: {
      region: this.REGIONS.EU,
      name: 'Benin',
      flag: '🇧🇯',
    },
    MU: {
      region: this.REGIONS.EU,
      name: 'Mauritius',
      flag: '🇲🇺',
    },
    LR: {
      region: this.REGIONS.EU,
      name: 'Liberia',
      flag: '🇱🇷',
    },
    SL: {
      region: this.REGIONS.EU,
      name: 'Sierra Leone',
      flag: '🇸🇱',
    },
    GH: {
      region: this.REGIONS.EU,
      name: 'Ghana',
      flag: '🇬🇭',
    },
    NG: {
      region: this.REGIONS.EU,
      name: 'Nigeria',
      flag: '🇳🇬',
    },
    TD: {
      region: this.REGIONS.EU,
      name: 'Chad',
      flag: '🇹🇩',
    },
    CF: {
      region: this.REGIONS.EU,
      name: 'Central African Republic',
      flag: '🇨🇫',
    },
    CM: {
      region: this.REGIONS.EU,
      name: 'Cameroon',
      flag: '🇨🇲',
    },
    CV: {
      region: this.REGIONS.EU,
      name: 'Cape Verde',
      flag: '🇨🇻',
    },
    GQ: {
      region: this.REGIONS.EU,
      name: 'Equatorial Guinea',
      flag: '🇬🇶',
    },
    GA: {
      region: this.REGIONS.EU,
      name: 'Gabon',
      flag: '🇬🇦',
    },
    CG: {
      region: this.REGIONS.EU,
      name: 'Republic of the Congo',
      flag: '🇨🇬',
    },
    CD: {
      region: this.REGIONS.EU,
      name: 'Democratic Republic of the Congo',
      flag: '🇨🇩',
    },
    AO: {
      region: this.REGIONS.EU,
      name: 'Angola',
      flag: '🇦🇴',
    },
    SC: {
      region: this.REGIONS.EU,
      name: 'Seychelles',
      flag: '🇸🇨',
    },
    RW: {
      region: this.REGIONS.EU,
      name: 'Rwanda',
      flag: '🇷🇼',
    },
    ET: {
      region: this.REGIONS.EU,
      name: 'Ethiopia',
      flag: '🇪🇹',
    },
    SO: {
      region: this.REGIONS.EU,
      name: 'Somalia',
      flag: '🇸🇴',
    },
    DJ: {
      region: this.REGIONS.EU,
      name: 'Djibouti',
      flag: '🇩🇯',
    },
    KE: {
      region: this.REGIONS.EU,
      name: 'Kenya',
      flag: '🇰🇪',
    },
    TZ: {
      region: this.REGIONS.EU,
      name: 'Tanzania',
      flag: '🇹🇿',
    },
    UG: {
      region: this.REGIONS.EU,
      name: 'Uganda',
      flag: '🇺🇬',
    },
    BI: {
      region: this.REGIONS.EU,
      name: 'Burundi',
      flag: '🇧🇮',
    },
    MZ: {
      region: this.REGIONS.EU,
      name: 'Mozambique',
      flag: '🇲🇿',
    },
    ZM: {
      region: this.REGIONS.EU,
      name: 'Zambia',
      flag: '🇿🇲',
    },
    MG: {
      region: this.REGIONS.EU,
      name: 'Madagascar',
      flag: '🇲🇬',
    },
    YT: {
      region: this.REGIONS.EU,
      name: 'Mayotte',
      flag: '🇾🇹',
    },
    ZW: {
      region: this.REGIONS.EU,
      name: 'Zimbabwe',
      flag: '🇿🇼',
    },
    NA: {
      region: this.REGIONS.EU,
      name: 'Namibia',
      flag: '🇳🇦',
    },
    MW: {
      region: this.REGIONS.EU,
      name: 'Malawi',
      flag: '🇲🇼',
    },
    LS: {
      region: this.REGIONS.EU,
      name: 'Lesotho',
      flag: '🇱🇸',
    },
    BW: {
      region: this.REGIONS.EU,
      name: 'Botswana',
      flag: '🇧🇼',
    },
    SZ: {
      region: this.REGIONS.EU,
      name: 'Eswatini',
      flag: '🇸🇿',
    },
    KM: {
      region: this.REGIONS.EU,
      name: 'Comoros',
      flag: '🇰🇲',
    },
    ER: {
      region: this.REGIONS.EU,
      name: 'Eritrea',
      flag: '🇪🇷',
    },
    AW: {
      region: this.REGIONS.EU,
      name: 'Aruba',
      flag: '🇦🇼',
    },
    FO: {
      region: this.REGIONS.EU,
      name: 'Faroe Islands',
      flag: '🇫🇴',
    },
    GL: {
      region: this.REGIONS.EU,
      name: 'Greenland',
      flag: '🇬🇱',
    },
    GI: {
      region: this.REGIONS.EU,
      name: 'Gibraltar',
      flag: '🇬🇮',
    },
    PT: {
      region: this.REGIONS.EU,
      name: 'Portugal',
      flag: '🇵🇹',
    },
    LU: {
      region: this.REGIONS.EU,
      name: 'Luxembourg',
      flag: '🇱🇺',
    },
    IE: {
      region: this.REGIONS.EU,
      name: 'Ireland',
      flag: '🇮🇪',
    },
    IS: {
      region: this.REGIONS.EU,
      name: 'Iceland',
      flag: '🇮🇸',
    },
    AL: {
      region: this.REGIONS.EU,
      name: 'Albania',
      flag: '🇦🇱',
    },
    MT: {
      region: this.REGIONS.EU,
      name: 'Malta',
      flag: '🇲🇹',
    },
    CY: {
      region: this.REGIONS.EU,
      name: 'Cyprus',
      flag: '🇨🇾',
    },
    FI: {
      region: this.REGIONS.EU,
      name: 'Finland',
      flag: '🇫🇮',
    },
    BG: {
      region: this.REGIONS.EU,
      name: 'Bulgaria',
      flag: '🇧🇬',
    },
    LT: {
      region: this.REGIONS.EU,
      name: 'Lithuania',
      flag: '🇱🇹',
    },
    LV: {
      region: this.REGIONS.EU,
      name: 'Latvia',
      flag: '🇱🇻',
    },
    EE: {
      region: this.REGIONS.EU,
      name: 'Estonia',
      flag: '🇪🇪',
    },
    MD: {
      region: this.REGIONS.EU,
      name: 'Moldova',
      flag: '🇲🇩',
    },
    AM: {
      region: this.REGIONS.EU,
      name: 'Armenia',
      flag: '🇦🇲',
    },
    BY: {
      region: this.REGIONS.EU,
      name: 'Belarus',
      flag: '🇧🇾',
    },
    AD: {
      region: this.REGIONS.EU,
      name: 'Andorra',
      flag: '🇦🇩',
    },
    MC: {
      region: this.REGIONS.EU,
      name: 'Monaco',
      flag: '🇲🇨',
    },
    SM: {
      region: this.REGIONS.EU,
      name: 'San Marino',
      flag: '🇸🇲',
    },
    VA: {
      region: this.REGIONS.EU,
      name: 'Vatican City',
      flag: '🇻🇦',
    },
    UA: {
      region: this.REGIONS.EU,
      name: 'Ukraine',
      flag: '🇺🇦',
    },
    RS: {
      region: this.REGIONS.EU,
      name: 'Serbia',
      flag: '🇷🇸',
    },
    ME: {
      region: this.REGIONS.EU,
      name: 'Montenegro',
      flag: '🇲🇪',
    },
    HR: {
      region: this.REGIONS.EU,
      name: 'Croatia',
      flag: '🇭🇷',
    },
    SI: {
      region: this.REGIONS.EU,
      name: 'Slovenia',
      flag: '🇸🇮',
    },
    BA: {
      region: this.REGIONS.EU,
      name: 'Bosnia and Herzegovina',
      flag: '🇧🇦',
    },
    MK: {
      region: this.REGIONS.EU,
      name: 'North Macedonia',
      flag: '🇲🇰',
    },
    CZ: {
      region: this.REGIONS.EU,
      name: 'Czech Republic',
      flag: '🇨🇿',
    },
    SK: {
      region: this.REGIONS.EU,
      name: 'Slovakia',
      flag: '🇸🇰',
    },
    LI: {
      region: this.REGIONS.EU,
      name: 'Liechtenstein',
      flag: '🇱🇮',
    },
    BZ: {
      region: this.REGIONS.EU,
      name: 'Belize',
      flag: '🇧🇿',
    },
    SV: {
      region: this.REGIONS.EU,
      name: 'El Salvador',
      flag: '🇸🇻',
    },
    HN: {
      region: this.REGIONS.EU,
      name: 'Honduras',
      flag: '🇭🇳',
    },
    NI: {
      region: this.REGIONS.EU,
      name: 'Nicaragua',
      flag: '🇳🇮',
    },
    CR: {
      region: this.REGIONS.EU,
      name: 'Costa Rica',
      flag: '🇨🇷',
    },
    PA: {
      region: this.REGIONS.EU,
      name: 'Panama',
      flag: '🇵🇦',
    },
    PM: {
      region: this.REGIONS.EU,
      name: 'Saint Pierre and Miquelon',
      flag: '🇵🇲',
    },
    HT: {
      region: this.REGIONS.EU,
      name: 'Haiti',
      flag: '🇭🇹',
    },
    MF: {
      region: this.REGIONS.EU,
      name: 'Saint Martin',
      flag: '🇲🇫',
    },
    GY: {
      region: this.REGIONS.EU,
      name: 'Guyana',
      flag: '🇬🇾',
    },
    MQ: {
      region: this.REGIONS.EU,
      name: 'Martinique',
      flag: '🇲🇶',
    },
    BN: {
      region: this.REGIONS.EU,
      name: 'Brunei',
      flag: '🇧🇳',
    },
    TO: {
      region: this.REGIONS.EU,
      name: 'Tonga',
      flag: '🇹🇴',
    },
    FJ: {
      region: this.REGIONS.EU,
      name: 'Fiji',
      flag: '🇫🇯',
    },
    PW: {
      region: this.REGIONS.EU,
      name: 'Palau',
      flag: '🇵🇼',
    },
    WF: {
      region: this.REGIONS.EU,
      name: 'Wallis and Futuna',
      flag: '🇼🇫',
    },
    WS: {
      region: this.REGIONS.EU,
      name: 'Samoa',
      flag: '🇼🇸',
    },
    NC: {
      region: this.REGIONS.EU,
      name: 'New Caledonia',
      flag: '🇳🇨',
    },
    TV: {
      region: this.REGIONS.EU,
      name: 'Tuvalu',
      flag: '🇹🇻',
    },
    PF: {
      region: this.REGIONS.EU,
      name: 'French Polynesia',
      flag: '🇵🇫',
    },
    FM: {
      region: this.REGIONS.EU,
      name: 'Micronesia',
      flag: '🇫🇲',
    },
    MH: {
      region: this.REGIONS.EU,
      name: 'Marshall Islands',
      flag: '🇲🇭',
    },
    KH: {
      region: this.REGIONS.EU,
      name: 'Cambodia',
      flag: '🇰🇭',
    },
    LA: {
      region: this.REGIONS.EU,
      name: 'Laos',
      flag: '🇱🇦',
    },
    BD: {
      region: this.REGIONS.EU,
      name: 'Bangladesh',
      flag: '🇧🇩',
    },
    MV: {
      region: this.REGIONS.EU,
      name: 'Maldives',
      flag: '🇲🇻',
    },
    LB: {
      region: this.REGIONS.EU,
      name: 'Lebanon',
      flag: '🇱🇧',
    },
    JO: {
      region: this.REGIONS.EU,
      name: 'Jordan',
      flag: '🇯🇴',
    },
    IQ: {
      region: this.REGIONS.EU,
      name: 'Iraq',
      flag: '🇮🇶',
    },
    KW: {
      region: this.REGIONS.EU,
      name: 'Kuwait',
      flag: '🇰🇼',
    },
    SA: {
      region: this.REGIONS.EU,
      name: 'Saudi Arabia',
      flag: '🇸🇦',
    },
    YE: {
      region: this.REGIONS.EU,
      name: 'Yemen',
      flag: '🇾🇪',
    },
    OM: {
      region: this.REGIONS.EU,
      name: 'Oman',
      flag: '🇴🇲',
    },
    AE: {
      region: this.REGIONS.EU,
      name: 'United Arab Emirates',
      flag: '🇦🇪',
    },
    IL: {
      region: this.REGIONS.EU,
      name: 'Israel',
      flag: '🇮🇱',
    },
    BH: {
      region: this.REGIONS.EU,
      name: 'Bahrain',
      flag: '🇧🇭',
    },
    QA: {
      region: this.REGIONS.EU,
      name: 'Qatar',
      flag: '🇶🇦',
    },
    BT: {
      region: this.REGIONS.EU,
      name: 'Bhutan',
      flag: '🇧🇹',
    },
    MN: {
      region: this.REGIONS.EU,
      name: 'Mongolia',
      flag: '🇲🇳',
    },
    NP: {
      region: this.REGIONS.EU,
      name: 'Nepal',
      flag: '🇳🇵',
    },
    TJ: {
      region: this.REGIONS.EU,
      name: 'Tajikistan',
      flag: '🇹🇯',
    },
    TM: {
      region: this.REGIONS.EU,
      name: 'Turkmenistan',
      flag: '🇹🇲',
    },
    AZ: {
      region: this.REGIONS.EU,
      name: 'Azerbaijan',
      flag: '🇦🇿',
    },
    GE: {
      region: this.REGIONS.EU,
      name: 'Georgia',
      flag: '🇬🇪',
    },
    KG: {
      region: this.REGIONS.EU,
      name: 'Kyrgyzstan',
      flag: '🇰🇬',
    },
    UZ: {
      region: this.REGIONS.EU,
      name: 'Uzbekistan',
      flag: '🇺🇿',
    },
    BS: {
      region: this.REGIONS.EU,
      name: 'Bahamas',
      flag: '🇧🇸',
    },
    BB: {
      region: this.REGIONS.EU,
      name: 'Barbados',
      flag: '🇧🇧',
    },
    AI: {
      region: this.REGIONS.EU,
      name: 'Anguilla',
      flag: '🇦🇮',
    },
    AG: {
      region: this.REGIONS.EU,
      name: 'Antigua and Barbuda',
      flag: '🇦🇬',
    },
    VG: {
      region: this.REGIONS.EU,
      name: 'British Virgin Islands',
      flag: '🇻🇬',
    },
    VI: {
      region: this.REGIONS.EU,
      name: 'U.S. Virgin Islands',
      flag: '🇻🇮',
    },
    KY: {
      region: this.REGIONS.EU,
      name: 'Cayman Islands',
      flag: '🇰🇾',
    },
    BM: {
      region: this.REGIONS.EU,
      name: 'Bermuda',
      flag: '🇧🇲',
    },
    GD: {
      region: this.REGIONS.EU,
      name: 'Grenada',
      flag: '🇬🇩',
    },
    TC: {
      region: this.REGIONS.EU,
      name: 'Turks and Caicos Islands',
      flag: '🇹🇨',
    },
    MS: {
      region: this.REGIONS.EU,
      name: 'Montserrat',
      flag: '🇲🇸',
    },
    MP: {
      region: this.REGIONS.EU,
      name: 'Northern Mariana Islands',
      flag: '🇲🇵',
    },
    GU: {
      region: this.REGIONS.EU,
      name: 'Guam',
      flag: '🇬🇺',
    },
    AS: {
      region: this.REGIONS.EU,
      name: 'American Samoa',
      flag: '🇦🇸',
    },
    LC: {
      region: this.REGIONS.EU,
      name: 'Saint Lucia',
      flag: '🇱🇨',
    },
    DM: {
      region: this.REGIONS.EU,
      name: 'Dominica',
      flag: '🇩🇲',
    },
    VC: {
      region: this.REGIONS.EU,
      name: 'Saint Vincent and the Grenadines',
      flag: '🇻🇨',
    },
    TT: {
      region: this.REGIONS.EU,
      name: 'Trinidad and Tobago',
      flag: '🇹🇹',
    },
    KN: {
      region: this.REGIONS.EU,
      name: 'Saint Kitts and Nevis',
      flag: '🇰🇳',
    },
    JM: {
      region: this.REGIONS.EU,
      name: 'Jamaica',
      flag: '🇯🇲',
    },

    // Western America Data Center
    US: {
      region: this.REGIONS.US,
      name: 'United States',
      flag: '🇺🇸',
    },
    CA: {
      region: this.REGIONS.US,
      name: 'Canada',
      flag: '🇨🇦',
    },
    PE: {
      region: this.REGIONS.US,
      name: 'Peru',
      flag: '🇵🇪',
    },
    MX: {
      region: this.REGIONS.US,
      name: 'Mexico',
      flag: '🇲🇽',
    },
    AR: {
      region: this.REGIONS.US,
      name: 'Argentina',
      flag: '🇦🇷',
    },
    BR: {
      region: this.REGIONS.US,
      name: 'Brazil',
      flag: '🇧🇷',
    },
    CL: {
      region: this.REGIONS.US,
      name: 'Chile',
      flag: '🇨🇱',
    },
    CO: {
      region: this.REGIONS.US,
      name: 'Colombia',
      flag: '🇨🇴',
    },
    VE: {
      region: this.REGIONS.US,
      name: 'Venezuela',
      flag: '🇻🇪',
    },
    MY: {
      region: this.REGIONS.US,
      name: 'Malaysia',
      flag: '🇲🇾',
    },
    ID: {
      region: this.REGIONS.US,
      name: 'Indonesia',
      flag: '🇮🇩',
    },
    PH: {
      region: this.REGIONS.US,
      name: 'Philippines',
      flag: '🇵🇭',
    },
    NZ: {
      region: this.REGIONS.US,
      name: 'New Zealand',
      flag: '🇳🇿',
    },
    TH: {
      region: this.REGIONS.US,
      name: 'Thailand',
      flag: '🇹🇭',
    },
    JP: {
      region: this.REGIONS.US,
      name: 'Japan',
      flag: '🇯🇵',
    },
    KR: {
      region: this.REGIONS.US,
      name: 'South Korea',
      flag: '🇰🇷',
    },
    VN: {
      region: this.REGIONS.US,
      name: 'Vietnam',
      flag: '🇻🇳',
    },
    MM: {
      region: this.REGIONS.US,
      name: 'Myanmar',
      flag: '🇲🇲',
    },
    ST: {
      region: this.REGIONS.US,
      name: 'São Tomé and Príncipe',
      flag: '🇸🇹',
    },
    GW: {
      region: this.REGIONS.US,
      name: 'Guinea-Bissau',
      flag: '🇬🇼',
    },
    IO: {
      region: this.REGIONS.US,
      name: 'British Indian Ocean Territory',
      flag: '🇮🇴',
    },
    FK: {
      region: this.REGIONS.US,
      name: 'Falkland Islands',
      flag: '🇫🇰',
    },
    GT: {
      region: this.REGIONS.US,
      name: 'Guatemala',
      flag: '🇬🇹',
    },
    BO: {
      region: this.REGIONS.US,
      name: 'Bolivia',
      flag: '🇧🇴',
    },
    EC: {
      region: this.REGIONS.US,
      name: 'Ecuador',
      flag: '🇪🇨',
    },
    GF: {
      region: this.REGIONS.US,
      name: 'French Guiana',
      flag: '🇬🇫',
    },
    PY: {
      region: this.REGIONS.US,
      name: 'Paraguay',
      flag: '🇵🇾',
    },
    SR: {
      region: this.REGIONS.US,
      name: 'Suriname',
      flag: '🇸🇷',
    },
    UY: {
      region: this.REGIONS.US,
      name: 'Uruguay',
      flag: '🇺🇾',
    },
    TL: {
      region: this.REGIONS.US,
      name: 'Timor-Leste',
      flag: '🇹🇱',
    },
    NF: {
      region: this.REGIONS.US,
      name: 'Norfolk Island',
      flag: '🇳🇫',
    },
    NR: {
      region: this.REGIONS.US,
      name: 'Nauru',
      flag: '🇳🇷',
    },
    PG: {
      region: this.REGIONS.US,
      name: 'Papua New Guinea',
      flag: '🇵🇬',
    },
    SB: {
      region: this.REGIONS.US,
      name: 'Solomon Islands',
      flag: '🇸🇧',
    },
    VU: {
      region: this.REGIONS.US,
      name: 'Vanuatu',
      flag: '🇻🇺',
    },
    CK: {
      region: this.REGIONS.US,
      name: 'Cook Islands',
      flag: '🇨🇰',
    },
    NU: {
      region: this.REGIONS.US,
      name: 'Niue',
      flag: '🇳🇺',
    },
    KI: {
      region: this.REGIONS.US,
      name: 'Kiribati',
      flag: '🇰🇮',
    },
    TK: {
      region: this.REGIONS.US,
      name: 'Tokelau',
      flag: '🇹🇰',
    },
    HK: {
      region: this.REGIONS.US,
      name: 'Hong Kong',
      flag: '🇭🇰',
    },
    MO: {
      region: this.REGIONS.US,
      name: 'Macau',
      flag: '🇲🇴',
    },
    TW: {
      region: this.REGIONS.US,
      name: 'Taiwan',
      flag: '🇹🇼',
    },
    PS: {
      region: this.REGIONS.US,
      name: 'Palestine',
      flag: '🇵🇸',
    },
    SX: {
      region: this.REGIONS.US,
      name: 'Sint Maarten',
      flag: '🇸🇽',
    },
    PR: {
      region: this.REGIONS.US,
      name: 'Puerto Rico',
      flag: '🇵🇷',
    },
    DO: {
      region: this.REGIONS.US,
      name: 'Dominican Republic',
      flag: '🇩🇴',
    },
    SJ: {
      region: this.REGIONS.US,
      name: 'Svalbard and Jan Mayen',
      flag: '🇸🇯',
    },
    CW: {
      region: this.REGIONS.US,
      name: 'Curaçao',
      flag: '🇨🇼',
    },
    AX: {
      region: this.REGIONS.US,
      name: 'Åland Islands',
      flag: '🇦🇽',
    },

    // India Data Center
    IN: {
      region: this.REGIONS.IN,
      name: 'India',
      flag: '🇮🇳',
    },

    // China Data Center
    CN: {
      region: this.REGIONS.CN,
      name: 'China',
      flag: '🇨🇳',
    },
  };

}

module.exports = TuyaOAuth2Constants;
