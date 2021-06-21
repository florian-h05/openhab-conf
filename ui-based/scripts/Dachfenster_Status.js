/*
This script creates the windows' states out of the three contacts.
Configure it in line 56.
It requires the following items (<room_1> should be replaced):
  "<room_1>_Dachfenster_zu"         as input
  "<room_1>_Dachfenster_klLueftung" as input
  "<room_1>_Dachfenster_grLueftung" as input
  "<room_1>_Dachfenster_Status"     as textual output
  "<room_1>_Dachfenster_Status_num" as numeric output
*/

var OutputStateText, OutputStateNum

var logger = Java.type('org.slf4j.LoggerFactory').getLogger('org.openhab.rule.' + ctx.ruleUID)

function generateState (currentRoom) {
  // set the itemnames of the contacts
  var ItemZu = currentRoom + '_Dachfenster_zu'
  var ItemKlLueftung = currentRoom + '_Dachfenster_klLueftung'
  var ItemGrLueftung = currentRoom + '_Dachfenster_grLueftung'
  // set the itemnames of the output items
  var ItemStateText = currentRoom + '_Fenster_Status'
  var ItemStateNum = currentRoom + '_Fenster_Status_num'
  // retrieve the contact states from openHAB
  var StateZu = itemRegistry.getItem(ItemZu).getState().toString()
  var StateKlLueftung = itemRegistry.getItem(ItemKlLueftung).getState().toString()
  var StateGrLueftung = itemRegistry.getItem(ItemGrLueftung).getState().toString()
  // checks for the different states.
  if (StateZu === 'OPEN' && StateKlLueftung === 'OPEN' && StateGrLueftung === 'OPEN') { // geschlossen
    OutputStateText = 'geschlossen'
    OutputStateNum = 1
  } else if (StateZu === 'CLOSED' && StateKlLueftung === 'OPEN' && StateGrLueftung === 'OPEN') { // kleine Lüftung
    OutputStateText = 'kleine Lüftung'
    OutputStateNum = 0.6
  } else if (StateZu === 'CLOSED' && StateKlLueftung === 'CLOSED' && StateGrLueftung === 'OPEN') { // große Lüftung
    OutputStateText = 'große Lüftung'
    OutputStateNum = 0.3
  } else if (StateZu === 'CLOSED' && StateKlLueftung === 'CLOSED' && StateGrLueftung === 'CLOSED') { // ganz geöffnet
    OutputStateText = 'ganz geöffnet'
    OutputStateNum = 0
  } else {
    OutputStateText = 'Fehler!'
    OutputStateNum = 0
  }
  events.postUpdate(ItemStateText, OutputStateText)
  events.postUpdate(ItemStateNum, OutputStateNum)
  // logger.info(([ItemStateText,' is: ', OutputStateText].join('')))
}

// insert your room names into the list
var roomList = ['room_1', 'room_2', 'room_3']
for (var roomIndex in roomList) {
  generateState(roomList[roomIndex])
}
