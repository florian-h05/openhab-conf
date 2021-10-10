/*
This script sends a thing's state to an openHAB item.
Configuration of the KNX IP router itemname in line 10.
How it works: gets the members of the KNXState and YamahaState groups and extracts the name of the thing.
  Then it iterates over all things and sends the state to openHAB items.
Items must be named in the following scheme: type"_"devicename"_state". Example: "KNX_Wetterstation_state".
Copyright (c) 2021 Florian Hotze under MIT License
*/

// KNX IP bridge state item name
var knxIpBridge = 'KNX_IP_Gateway_state'

this.OPENHAB_CONF = (this.OPENHAB_CONF === undefined) ? java.lang.System.getenv('OPENHAB_CONF') : this.OPENHAB_CONF
load(OPENHAB_CONF + '/automation/lib/javascript/community/groupUtils.js')
var logger = Java.type('org.slf4j.LoggerFactory').getLogger('org.openhab.rule.' + ctx.ruleUID)
var ThingUID = Java.type('org.openhab.core.thing.ThingUID')
var NotificationAction = Java.type('org.openhab.io.openhabcloud.NotificationAction')

// update the thing status item in openHAB
function updateThingStatus (thingName, itemName) {
  // get the state of the thing
  var thingStatus = new String(things.get(new ThingUID(thingName)).status)
  // logger.info('Thing: "' + thingName + '" state is: ' + thingStatus)
  if ((thingStatus != undefined) && (thingStatus == 'ONLINE')) {
    // update openHAB state item
    events.postUpdate(itemName, thingStatus)
  } else {
    events.postUpdate(itemName, thingStatus)
  }
}

// KNX Things
var groupMembers = getMembersNames('KNXState')
// remove KNX IP bridge from array
for (var i = 0; i < groupMembers.length; i++) {
  if (groupMembers[i] === knxIpBridge) {
    groupMembers.splice(i, 1)
  }
}
updateThingStatus('knx:ip:bridge', knxIpBridge)
for (var index in groupMembers) {
  var name = groupMembers[index].replace('KNX_', '')
  name = name.replace('_state', '')
  updateThingStatus('knx:device:bridge:' + name, groupMembers[index])
}

// Yamaha Things
groupMembers = getMembersNames('YamahaState')
for (var index in groupMembers) {
  var name = groupMembers[index].replace('Yamaha_', '')
  name = name.replace('_state', '')
  updateThingStatus('yamahareceiver:yamahaAV:' + name, groupMembers[index])
}
