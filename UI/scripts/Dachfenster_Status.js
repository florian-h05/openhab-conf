/*
This script creates the roofwindows' states out of the three contacts.
Configuration on top of the file.
It requires the following items (<room_1> should be replaced):
  "<room_1>_Dachfenster_zu"         as input
  "<room_1>_Dachfenster_klLueftung" as input
  "<room_1>_Dachfenster_grLueftung" as input
  "<room_1>_Dachfenster_Status"     as textual output
  "<room_1>_Dachfenster_Status_num" as numeric output

Copyright (c) 2021 Florian Hotze under MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

/*
Configuration
*/
// insert your room names into the list
var roomList = ['room_1', 'room_2', 'room_3'];

/*
Script starts here. Do not modify.
*/
var logger = Java.type('org.slf4j.LoggerFactory').getLogger('org.openhab.rule.' + ctx.ruleUID);

/**
 * Generate the state from the three contacts.
 *
 * @param {string} currentRoom Name of the roowindows' room.
*/
function generateState (currentRoom) {
  var OutputStateText, OutputStateNum;
  // Set the itemnames of the output items.
  var ItemStateText = currentRoom + '_Fenster_Status';
  var ItemStateNum = currentRoom + '_Fenster_Status_num';
  // Retrieve the contact states from openHAB.
  var StateZu = itemRegistry.getItem(currentRoom + '_Dachfenster_zu').getState().toString();
  var StateKlLueftung = itemRegistry.getItem(currentRoom + '_Dachfenster_klLueftung').getState().toString();
  var StateGrLueftung = itemRegistry.getItem(currentRoom + '_Dachfenster_grLueftung').getState().toString();
  // checks for the different states.
  if (StateZu === 'CLOSED' && StateKlLueftung === 'CLOSED' && StateGrLueftung === 'CLOSED') { // geschlossen
    OutputStateText = 'geschlossen';
    OutputStateNum = 1;
  } else if (StateZu === 'OPEN' && StateKlLueftung === 'CLOSED' && StateGrLueftung === 'CLOSED') { // kleine Lüftung
    OutputStateText = 'kleine Lüftung';
    OutputStateNum = 0.6;
  } else if (StateZu === 'OPEN' && StateKlLueftung === 'OPEN' && StateGrLueftung === 'CLOSED') { // große Lüftung
    OutputStateText = 'große Lüftung';
    OutputStateNum = 0.3;
  } else if (StateZu === 'OPEN' && StateKlLueftung === 'OPEN' && StateGrLueftung === 'OPEN') { // ganz geöffnet
    OutputStateText = 'ganz geöffnet';
    OutputStateNum = 0;
  } else {
    OutputStateText = 'Fehler!';
    OutputStateNum = 0;
  }
  events.postUpdate(ItemStateText, OutputStateText);
  events.postUpdate(ItemStateNum, OutputStateNum);
}

for (var roomIndex in roomList) {
  generateState(roomList[roomIndex]);
}
