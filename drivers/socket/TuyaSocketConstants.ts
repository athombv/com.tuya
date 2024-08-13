'use strict'

export default class TuyaSocketConstants {
  static SOCKET_SETTING_LABELS = {
    child_lock: "Child Lock",
    relay_status: "Turn On Behavior"
  } as const;
}

module.exports = TuyaSocketConstants;
