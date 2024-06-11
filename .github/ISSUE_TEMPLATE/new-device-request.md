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

Then pair a 'Light', even if your device is not a light. Watch the logging closely for `Device: ` and copy-paste the JSON in this issue.

Without this information, we cannot add support for your device, and the issue will be closed.

For example:

```
2024-06-06T14:11:59.852Z [log] [Homey:xxxxxx] [ManagerDrivers] [Driver:light] Device: {"active_time":1717491339,"biz_type":0,"category":"dj","create_time":1717491339,"icon":"smart/icon/bay1582725542891RIK5/42feb5d93f5e13800cf2ade23ea49459.png","id":"xxxxxx","ip":"xxxxxx","lat":"52.25","local_key":"xxxxx","lon":"6.3","model":"SH.63.204","name":"G95 Gold","online":true,"owner_id":"xxxxx","product_id":"xxxxxx","product_name":"G95 Gold","status":[{"code":"switch_led","value":true},{"code":"work_mode","value":"white"},{"code":"bright_value_v2","value":223},{"code":"temp_value_v2","value":0},{"code":"scene_data_v2","value":"{\"scene_num\":1,\"scene_units\":[{\"bright\":200,\"h\":0,\"s\":0,\"temperature\":0,\"unit_change_mode\":\"static\",\"unit_gradient_duration\":13,\"unit_switch_duration\":14,\"v\":0}]}"},{"code":"countdown_1","value":0},{"code":"control_data","value":""},{"code":"remote_switch","value":true}],"sub":false,"time_zone":"+02:00","uid":"xxxxxx","update_time":1717671377,"uuid":"xxxxxx"}
```

Finally, please link to more information about the device, e.g. the manufacturer's website.
