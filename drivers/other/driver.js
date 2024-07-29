"use strict";

const TuyaOAuth2Driver = require("../../lib/TuyaOAuth2Driver");
const TuyaOAuth2Util = require("../../lib/TuyaOAuth2Util");

module.exports = class TuyaOAuth2DriverOther extends TuyaOAuth2Driver {
  onTuyaPairListDeviceFilter() {
    return true; // Accept any device
  }

  onTuyaPairListDeviceProperties(device, specifications) {
    const props = super.onTuyaPairListDeviceProperties(device);

    const combinedSpecification = {
      device: device,
      specifications: specifications,
    };

    props.settings["deviceSpecification"] = JSON.stringify(
      TuyaOAuth2Util.redactFields(combinedSpecification),
      undefined,
      2,
    );

    return props;
  }
};
