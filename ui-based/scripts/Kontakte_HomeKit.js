/*
This script converts my KNX contact state to the state for the HomeKit item.
Configure it in lines 34 and 36.
Splitting example: "Room1_Fenster_zu" --> "Room1_Fenster" and suffix "_zu"
*/

var inputItem, outputItem

var logger = Java.type('org.slf4j.LoggerFactory').getLogger('org.openhab.rule.' + ctx.ruleUID)

function buildItemNames (ItemName, ItemSuffix) {
  inputItem = ItemName
  inputItem += ItemSuffix
  outputItem = ItemName
  outputItem += 'HK'
}

function convertState (ItemName, ItemSuffix) {
  buildItemNames(ItemName, ItemSuffix)
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

// insert your contact items' names beginning into the list
var contactList = ['room1_Fenster', 'room2_Fenster', 'room3_Fronttuer']
// insert your contact items' suffix into the list
var suffixList = ['_zu', '_zu', '_Status']
for (var index in contactList) {
  convertState(contactList[index], suffixList[index])
}
