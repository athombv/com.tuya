import { TuyaDeviceResponse, TuyaDeviceSpecificationResponse } from '../../types/TuyaApiTypes';
import {
  TEMPERATURE_HUMIDITY_CAPABILITY_MAPPING,
  TEMPERATURE_HUMIDITY_SENSOR_CAPABILITIES,
} from './TuyaTemperatureHumiditySensorConstants';
import { ListDeviceProperties } from '../../lib/TuyaOAuth2Driver';
import TuyaOAuth2DriverSensor from '../../lib/TuyaOAuth2DriverSensor';
import { DEVICE_CATEGORIES } from '../../lib/TuyaOAuth2Constants';
import { constIncludes } from '../../lib/TuyaOAuth2Util';

module.exports = class TuyaOAuth2DriverSensorTemperatureHumidity extends TuyaOAuth2DriverSensor {
  TUYA_DEVICE_CATEGORIES = [DEVICE_CATEGORIES.SECURITY_VIDEO_SURV.TEMP_HUMI_SENSOR];

  onTuyaPairListDeviceProperties(
    device: TuyaDeviceResponse,
    specifications: TuyaDeviceSpecificationResponse,
  ): ListDeviceProperties {
    const props = super.onTuyaPairListDeviceProperties(device, specifications);

    for (const status of device.status) {
      const tuyaCapability = status.code;
      const homeyCapability =
        TEMPERATURE_HUMIDITY_CAPABILITY_MAPPING[tuyaCapability as keyof typeof TEMPERATURE_HUMIDITY_CAPABILITY_MAPPING];

      // Capabilities that map one to one
      if (homeyCapability) {
        props.store.tuya_capabilities.push(tuyaCapability);
        props.capabilities.push(homeyCapability);
      }
    }

    // Remove duplicate capabilities
    props.capabilities = [...new Set(props.capabilities)];

    for (const statusSpecifications of specifications.status) {
      const tuyaCapability = statusSpecifications.code;
      const values = JSON.parse(statusSpecifications.values);

      if (constIncludes(TEMPERATURE_HUMIDITY_SENSOR_CAPABILITIES.read_only_scaled, tuyaCapability)) {
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
