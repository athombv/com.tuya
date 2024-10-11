import { DEVICE_CATEGORIES } from '../../lib/TuyaOAuth2Constants';
import { ListDeviceProperties } from '../../lib/TuyaOAuth2Driver';
import TuyaOAuth2DriverSensor from '../../lib/TuyaOAuth2DriverSensor';
import {
  type TuyaDeviceDataPointResponse,
  TuyaDeviceResponse,
  TuyaDeviceSpecificationResponse,
} from '../../types/TuyaApiTypes';
import { constIncludes } from '../../lib/TuyaOAuth2Util';
import { HUMAN_SENSOR_CAPABILITIES, HUMAN_SENSOR_FLOWS, HUMAN_SENSOR_SETTING_LABELS } from './TuyaHumanSensorConstants';
import { StandardDeviceFlowArgs } from '../../types/TuyaTypes';

module.exports = class TuyaOAuth2DriverHuman extends TuyaOAuth2DriverSensor {
  TUYA_DEVICE_CATEGORIES = [DEVICE_CATEGORIES.SECURITY_VIDEO_SURV.PRESENCE_DETECTOR] as const;

  async onInit(): Promise<void> {
    await super.onInit();

    for (const setting of HUMAN_SENSOR_FLOWS.setting) {
      this.addSettingFlowHandler(setting, HUMAN_SENSOR_SETTING_LABELS);
    }

    this.homey.flow
      .getConditionCard('sensor_human_alarm_human_is_true')
      .registerRunListener((args: StandardDeviceFlowArgs) => args.device.getCapabilityValue('alarm_human'));
  }

  onTuyaPairListDeviceProperties(
    device: TuyaDeviceResponse,
    specifications?: TuyaDeviceSpecificationResponse,
    dataPoints?: TuyaDeviceDataPointResponse,
  ): ListDeviceProperties {
    const props = super.onTuyaPairListDeviceProperties(device, specifications, dataPoints);

    props.store._migrations = [...(props.store._migrations ?? []), 'sensor_human_capabilities'];

    for (const status of device.status) {
      const tuyaCapability = status.code;

      if (tuyaCapability === 'presence_state') {
        props.store.tuya_capabilities.push(tuyaCapability);
        props.capabilities.push('alarm_human');
      } else if (constIncludes(HUMAN_SENSOR_CAPABILITIES.setting, tuyaCapability)) {
        props.store.tuya_capabilities.push(tuyaCapability);
      }
    }

    if (!specifications || !specifications.status) {
      return props;
    }

    for (const specification of specifications.status) {
      const tuyaCapability = specification.code;
      const values = JSON.parse(specification.values);

      if (tuyaCapability === 'presence_state') {
        if (values.range && !values.range.includes('none')) {
          props.settings['use_alarm_timeout'] = true;
        }
      }
    }

    return props;
  }
};
