/*
This script converts KNX contact states to the statex for the HomeKit item.
Requires: 
 - All items to convert in one group and with the same suffix.
 - The HK item in the scheme: main item without suffix + 'HK'. Example: room_window_closed & room_windowHK
Configuration:
 - Suffix in line 53.
 - Groupname in line 50.
*/

// used global
var groupMembers

var logger = Java.type('org.slf4j.LoggerFactory').getLogger('org.openhab.rule.' + ctx.ruleUID)

function convertState (ItemName, ItemSuffix) {
  var inputItem = ItemName
  var outputItem = ItemName.replace(ItemSuffix, '')
  outputItem += 'HK'
  var inputState = itemRegistry.getItem(inputItem).getState().toString()
  // logger.info(([inputItem, ' is: ', inputState].join('')))
  if (inputState === 'OPEN') {
    events.postUpdate(outputItem, 'CLOSED')
    // logger.info(([outputItem, ' is: CLOSED'].join('')))
  } else if (inputState === 'CLOSED') {
    events.postUpdate(outputItem, 'OPEN')
    // logger.info(([outputItem, ' is: OPEN'].join('')))
  } else {
    events.postUpdate(outputItem, 'NULL')
  }
}

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

getGroupMembers('KontakteHK')
for (var index in groupMembers) {
  // configure the main items' suffix.
  convertState(groupMembers[index], '_zu')
}
