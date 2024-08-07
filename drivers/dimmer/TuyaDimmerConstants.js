'use strict'

class TuyaDimmerConstants {
  // TODO make translatable
  // Map from setting id to human-readable label
  static DIMMER_SETTING_LABELS = {
    brightness_min_1: "Minimum Brightness 1",
    brightness_max_1: "Maximum Brightness 1",
    brightness_min_2: "Minimum Brightness 2",
    brightness_max_2: "Maximum Brightness 2",
    led_type_1: "Lamp Type 1",
    led_type_2: "Lamp Type 2",
  };

  static SIMPLE_DIMMER_CAPABILITIES = {
    read_write: [
      "switch_led_1",
      "bright_value_1",
      "switch_led_2",
      "bright_value_2",
    ],
    read_only: [],
    setting: [
      "brightness_min_1",
      "brightness_max_1",
      "brightness_min_2",
      "brightness_max_2",
      "led_type_1",
      "led_type_2",
    ],
  };
}

module.exports = TuyaDimmerConstants;
