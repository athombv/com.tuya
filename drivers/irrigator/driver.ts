import { DEVICE_CATEGORIES } from '../../lib/TuyaOAuth2Constants';
import TuyaOAuth2Driver, { ListDeviceProperties } from '../../lib/TuyaOAuth2Driver';
import {
  type TuyaDeviceDataPointResponse,
  TuyaDeviceResponse,
  TuyaDeviceSpecificationResponse,
} from '../../types/TuyaApiTypes';
import { constIncludes, getFromMap } from '../../lib/TuyaOAuth2Util';
import { IRRIGATOR_CAPABILITIES, IRRIGATOR_CAPABILITIES_MAPPING } from './TuyaIrrigatorConstants';
import { StandardDeviceFlowArgs } from '../../types/TuyaTypes';

module.exports = class TuyaOAuth2DriverHeater extends TuyaOAuth2Driver {
  TUYA_DEVICE_CATEGORIES = [DEVICE_CATEGORIES.SMALL_HOME_APPLIANCES.IRRIGATOR, 'sfkzq'] as const;

  async onInit(): Promise<void> {
    await super.onInit();

    this.homey.flow
      .getConditionCard('irrigator_rain_sensor_is_true')
      .registerRunListener((args: StandardDeviceFlowArgs) => args.device.getCapabilityValue('rain_sensor'));
  }

  onTuyaPairListDeviceProperties(
    device: TuyaDeviceResponse,
    specifications?: TuyaDeviceSpecificationResponse,
    dataPoints?: TuyaDeviceDataPointResponse,
  ): ListDeviceProperties {
    const props = super.onTuyaPairListDeviceProperties(device, specifications, dataPoints);

    for (const status of device.status) {
      const tuyaCapability = status.code;

      const homeyCapability = getFromMap(IRRIGATOR_CAPABILITIES_MAPPING, tuyaCapability);
      if (homeyCapability) {
        props.store.tuya_capabilities.push(tuyaCapability);
        props.capabilities.push(homeyCapability);
      }
    }

    props.capabilitiesOptions['measure_battery.rain_sensor'] = {
      title: {
        en: 'Rain sensor battery',
      },
    };

    props.capabilitiesOptions['measure_battery.climate_sensor'] = {
      title: {
        en: 'Climate sensor battery',
      },
    };

    if (!specifications || !specifications.status) {
      return props;
    }

    for (const status of specifications.status) {
      const tuyaCapability = status.code;
      const values = JSON.parse(status.values);

      if (constIncludes(IRRIGATOR_CAPABILITIES.read_only_scaled, tuyaCapability)) {
        if ([0, 1, 2, 3].includes(values.scale)) {
          props.settings[`${tuyaCapability}_scaling`] = `${values.scale}`;
        } else {
          this.error(`Unsupported ${tuyaCapability} scale:`, values.scale);
        }
      }
    }

    return props;
  }
};
