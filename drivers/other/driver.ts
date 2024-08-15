import TuyaOAuth2Driver, { ListDeviceProperties } from '../../lib/TuyaOAuth2Driver';
import * as TuyaOAuth2Util from '../../lib/TuyaOAuth2Util';
import { TuyaDeviceResponse, TuyaDeviceSpecificationResponse } from '../../types/TuyaApiTypes';

module.exports = class TuyaOAuth2DriverOther extends TuyaOAuth2Driver {
  onTuyaPairListDeviceFilter(): boolean {
    return true; // Accept any device
  }

  onTuyaPairListDeviceProperties(
    device: TuyaDeviceResponse,
    specifications?: TuyaDeviceSpecificationResponse,
  ): ListDeviceProperties {
    const props = super.onTuyaPairListDeviceProperties(device);

    const combinedSpecification = {
      device: TuyaOAuth2Util.redactFields(device),
      specifications: specifications ?? '<not available>',
    };

    props.settings['deviceSpecification'] = JSON.stringify(combinedSpecification, undefined, 2);

    return props;
  }
};
