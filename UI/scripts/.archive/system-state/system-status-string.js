/*
This script generates a system status overview string.
How it works: Iterates of the members of the KNXState and YamahaState groups.
The "Unique ID" of this script should be: "system-status-string-script".
Copyright (c) 2021 Florian Hotze under MIT License
*/

// used global
var knx = false, yamaha = false // are used as boolean, indicate whether at least one thins is offline
var statusString = '' // contains the generated text

this.OPENHAB_CONF = (this.OPENHAB_CONF === undefined) ? java.lang.System.getenv('OPENHAB_CONF') : this.OPENHAB_CONF
load(OPENHAB_CONF + '/automation/lib/javascript/community/groupUtils.js')
var logger = Java.type('org.slf4j.LoggerFactory').getLogger('org.openhab.rule.' + ctx.ruleUID)

// KNX Things
var groupMembers = getMembersNames('KNXState')
for (var index in groupMembers) {
  var status = itemRegistry.getItem(groupMembers[index]).getState().toString()
  if (status != 'ONLINE') {
    knx = true
  }
}

// Yamaha Things
var groupMembers = getMembersNames('YamahaState')
for (var index in groupMembers) {
  var status = itemRegistry.getItem(groupMembers[index]).getState().toString()
  if (status != 'ONLINE') {
    yamaha = true
  }
}

// generate status string
if (knx === true) {
  statusString += 'mind. 1 KNX Gerät nicht erreichbar!'
} else if (knx === false) {
  statusString += 'KNX okay'
}
if (yamaha === true) {
  statusString += '; mind. 1 Verstärker nicht erreichbar!'
} else if (yamaha === false) {
  statusString += '; Verstärker okay'
}
// post string to openHAB item
events.postUpdate('Systemstatus', statusString)
