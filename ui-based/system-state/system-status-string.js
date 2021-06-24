/*
This script generates a system status overview string.
How it works: Iterates of the members of the KNXState and YamahaState groups.
The "Unique ID" of this script should be: "system-status-string-script".
*/

// used global
var groupMembers // is an array
var knx = false, yamaha = false // are used as boolean, indicate whether at least one thins is offline
var statusString = '' // contains the generated text

var logger = Java.type('org.slf4j.LoggerFactory').getLogger('org.openhab.rule.' + ctx.ruleUID)

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

// KNX Things
getGroupMembers('KNXState')
for (var index in groupMembers) {
  var status = itemRegistry.getItem(groupMembers[index]).getState().toString()
  if (status != 'ONLINE') {
    knx = true
  }
}

// Yamaha Things
getGroupMembers('YamahaState')
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

// logger.info('KNX offline: ' + knx)
// logger.info('Yamaha offline: ' + yamaha)
// logger.info('Systemstatus: ' + statusString)
