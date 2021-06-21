/*
This script sends a thing's state to an openHAB item.
Configuration of the KNX IP router itemname in line 12.
How it works: gets the members of the KNXState and YamahaState groups and extracts the name of the thing.
  Then it iterates over all things and sends the state to openHAB items.
Items must be named in the following scheme: type"_"devicename"_state". Example: "KNX_Wetterstation_state"
*/

// used global
var groupMembers // is an array
// KNX IP bridge state item name
var knxIpBridge = 'KNX_IP_Gateway_state'

var logger = Java.type('org.slf4j.LoggerFactory').getLogger('org.openhab.rule.' + ctx.ruleUID)
var ThingUID = Java.type('org.openhab.core.thing.ThingUID')

// Get the members of a group. Call it with the group item's name.
function getGroupMembers (groupName) {
  var membersString = new String(ir.getItem(groupName).members)
  var membersSplit = membersString.split(' (')
  var firstMember = membersSplit[0].split('[')
  groupMembers = [firstMember[1]]
  // remove the first element
  membersSplit.splice(0, 1)
  // remove the last element
  membersSplit.splice(-1, 1)
  // iterate over the rest of membersSplit and add to groupMembers
  for (var index in membersSplit) {
    var nMember = membersSplit[index].split('), ')
    groupMembers.push(nMember[1])
  }
}

// update the thing status item in openHAB and call Notification()
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
getGroupMembers('KNXState')
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
getGroupMembers('YamahaState')
for (var index in groupMembers) {
  var name = groupMembers[index].replace('Yamaha_', '')
  name = name.replace('_state', '')
  updateThingStatus('yamahareceiver:yamahaAV:' + name, groupMembers[index])
}
