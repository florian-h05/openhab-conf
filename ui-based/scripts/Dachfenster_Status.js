/*
This script creates the windows' states out of the three contacts.
Configure it in line 57.
It requires the following items (<room_1> should be replaced):
  "<room_1>_Fenster_zu"         as input
  "<room_1>_Fenster_klLueftung" as input
  "<room_1>_Fenster_grLueftung" as input
  "<room_1>_Fenster_Status"     as textual output
  "<room_1>_Fenster_Status_num" as numeric output
*/

var currentRoom, room, Item_zu, Item_klLueftung, Item_grLueftung, Item_stateText, Item_StateNum, State_zu, State_klLueftung, State_grLueftung, Output_stateText, Output_stateNum;

var logger = Java.type('org.slf4j.LoggerFactory').getLogger('org.openhab.rule.' + ctx.ruleUID);

function generateState(currentRoom) {
  // set the itemnames of the contacts
  Item_zu = currentRoom;
  Item_klLueftung = currentRoom;
  Item_grLueftung = currentRoom;
  Item_zu += '_Fenster_zu';
  Item_klLueftung += '_Fenster_klLueftung';
  Item_grLueftung += '_Fenster_grLueftung';
  // set the itemnames of the output items
  Item_stateText = currentRoom;
  Item_StateNum = currentRoom;
  Item_stateText += '_Fenster_Status';
  Item_StateNum += '_Fenster_Status_num';
  // retrieve the contact states from openHAB
  State_zu = itemRegistry.getItem(Item_zu).getState();
  State_klLueftung = itemRegistry.getItem(Item_klLueftung).getState();
  State_grLueftung = itemRegistry.getItem(Item_grLueftung).getState();
  // checks for the different states.
  if (State_zu == 'OPEN' && State_klLueftung == 'OPEN' && State_grLueftung == 'OPEN') { //geschlossen
    Output_stateText = 'geschlossen';
    Output_stateNum = 1;
  } else if (State_zu == 'CLOSED' && State_klLueftung == 'OPEN' && State_grLueftung == 'OPEN') { //kleine Lüftung
    Output_stateText = 'kleine Lüftung';
    Output_stateNum = 0.6;
  } else if (State_zu == 'CLOSED' && State_klLueftung == 'CLOSED' && State_grLueftung == 'OPEN') { //große Lüftung
    Output_stateText = 'große Lüftung';
    Output_stateNum = 0.3;
  } else if (State_zu == 'CLOSED' && State_klLueftung == 'CLOSED' && State_grLueftung == 'CLOSED') { //ganz geöffnet
    Output_stateText = 'ganz geöffnet';
    Output_stateNum = 0;
  } else {
    Output_stateText = 'Fehler!';
    Output_stateNum = 0;
  }
  events.postUpdate(Item_stateText, Output_stateText);
  events.postUpdate(Item_StateNum, Output_stateNum);
  logger.info(([Item_stateText,' is: ',Output_stateText].join('')));
}


// insert your room names into the list
var room_list = ['room_1', 'room_2', 'room_3'];
for (var room_index in room_list) {
  room = room_list[room_index];
  generateState(room);
}
