/*
This script converts KNX contact states to the statex for the HomeKit item.
Requires:
 - All items to convert in one group and with the same suffix.
 - The HK item in the scheme: main item without suffix + 'HK'. Example: room_window_closed & room_windowHK
Configuration:
 - Suffix in line 52.
 - Groupname in line 51.
Copyright (c) 2021 Florian Hotze under MIT License
*/

this.OPENHAB_CONF = (this.OPENHAB_CONF === undefined) ? java.lang.System.getenv('OPENHAB_CONF') : this.OPENHAB_CONF
load(OPENHAB_CONF + '/automation/lib/javascript/community/groupUtils.js')
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

var groupMembers = getMembersNames('KontakteHK')
for (var index in groupMembers) {
  // configure the main items' suffix.
  convertState(groupMembers[index], '_zu')
}
