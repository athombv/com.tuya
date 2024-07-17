---
name: New Device Request
about: Request support for a Tuya device
title: 'Request Device: <Device Type>'
labels: ''
assignees: ''

---

To request a new device, please run the Tuya app locally using Homey CLI.

```bash
$ git clone git@github.com:athombv/com.tuya.git
$ cd com.tuya
$ homey app run 
```

Then pair it as an 'Other' device. You can now find its specifications in the device settings, and copy-paste them in this issue.

Without this information, we cannot add support for your device, and the issue will be closed.

For example:
```json
{ "device": { "active_time": 1719918768, "biz_type": 18, "category": "pc", "create_time": 1718115709, "icon": "smart/icon/bay1582725542891RIK5/d5f78108692f322f51b9a419a2c64f7a.png", "id": "x", "ip": "x", "lat": "x", "local_key": "x", "lon": "x", "model": "SH.63.216", "name": "Smart Plug Dual EU (NL)", "online": true, "owner_id": "x", "product_id": "x", "product_name": "Smart Plug Dual EU (NL)", "status": [ { "code": "switch_1", "value": true }, { "code": "switch_2", "value": true }, { "code": "countdown_1", "value": 0 }, { "code": "countdown_2", "value": 0 }, { "code": "add_ele", "value": 73 }, { "code": "cur_current", "value": 0 }, { "code": "cur_power", "value": 0 }, { "code": "cur_voltage", "value": 2333 }, { "code": "relay_status", "value": "last" }, { "code": "cycle_time", "value": "" }, { "code": "random_time", "value": "" } ], "sub": false, "time_zone": "+02:00", "uid": "x", "update_time": 1721219055, "uuid": "x" }, "specifications": { "category": "pc", "functions": [ { "code": "switch_1", "desc": "{}", "name": "开关1", "type": "Boolean", "values": "{}" }, { "code": "switch_2", "desc": "{}", "name": "开关2", "type": "Boolean", "values": "{}" }, { "code": "countdown_1", "desc": "{\"unit\":\"s\",\"min\":0,\"max\":86400,\"scale\":0,\"step\":1}", "name": "开关1倒计时", "type": "Integer", "values": "{\"unit\":\"s\",\"min\":0,\"max\":86400,\"scale\":0,\"step\":1}" }, { "code": "countdown_2", "desc": "{\"unit\":\"s\",\"min\":0,\"max\":86400,\"scale\":0,\"step\":1}", "name": "开关2倒计时", "type": "Integer", "values": "{\"unit\":\"s\",\"min\":0,\"max\":86400,\"scale\":0,\"step\":1}" }, { "code": "relay_status", "desc": "{\"range\":[\"power_off\",\"power_on\",\"last\"]}", "name": "上电状态", "type": "Enum", "values": "{\"range\":[\"power_off\",\"power_on\",\"last\"]}" }, { "code": "cycle_time", "desc": "{}", "name": "循环定时", "type": "String", "values": "{}" }, { "code": "random_time", "desc": "{}", "name": "随机定时", "type": "String", "values": "{}" } ], "status": [ { "code": "switch_1", "name": "开关1", "type": "Boolean", "values": "{}" }, { "code": "switch_2", "name": "开关2", "type": "Boolean", "values": "{}" }, { "code": "countdown_1", "name": "开关1倒计时", "type": "Integer", "values": "{\"unit\":\"s\",\"min\":0,\"max\":86400,\"scale\":0,\"step\":1}" }, { "code": "countdown_2", "name": "开关2倒计时", "type": "Integer", "values": "{\"unit\":\"s\",\"min\":0,\"max\":86400,\"scale\":0,\"step\":1}" }, { "code": "add_ele", "name": "增加电量", "type": "Integer", "values": "{\"unit\":\"kwh\",\"min\":0,\"max\":50000,\"scale\":3,\"step\":100}" }, { "code": "cur_current", "name": "当前电流", "type": "Integer", "values": "{\"unit\":\"mA\",\"min\":0,\"max\":30000,\"scale\":0,\"step\":1}" }, { "code": "cur_power", "name": "当前功率", "type": "Integer", "values": "{\"unit\":\"W\",\"min\":0,\"max\":80000,\"scale\":1,\"step\":1}" }, { "code": "cur_voltage", "name": "当前电压", "type": "Integer", "values": "{\"unit\":\"V\",\"min\":0,\"max\":5000,\"scale\":1,\"step\":1}" }, { "code": "relay_status", "name": "上电状态", "type": "Enum", "values": "{\"range\":[\"power_off\",\"power_on\",\"last\"]}" }, { "code": "cycle_time", "name": "循环定时", "type": "String", "values": "{}" }, { "code": "random_time", "name": "随机定时", "type": "String", "values": "{}" } ] } }
```

Finally, please link to more information about the device, e.g. the manufacturer's website.
