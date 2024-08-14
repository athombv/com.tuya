import TuyaOAuth2Driver from "../../lib/TuyaOAuth2Driver";
import * as TuyaOAuth2Util from "../../lib/TuyaOAuth2Util";
import {TuyaDeviceResponse, TuyaDeviceSpecificationResponse} from "../../types/TuyaApiTypes";

export default class TuyaOAuth2DriverOther extends TuyaOAuth2Driver {
  onTuyaPairListDeviceFilter() {
    return true; // Accept any device
  }

  onTuyaPairListDeviceProperties(device: TuyaDeviceResponse, specifications: TuyaDeviceSpecificationResponse) {
    const props = super.onTuyaPairListDeviceProperties(device);

    const combinedSpecification = {
      device: TuyaOAuth2Util.redactFields(device),
      specifications: specifications,
    };

    props.settings["deviceSpecification"] = JSON.stringify(
      combinedSpecification,
      undefined,
      2,
    );

    return props;
  }
};

module.exports = TuyaOAuth2DriverOther;
