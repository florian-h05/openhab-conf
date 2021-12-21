/*
Copyright (c) 2021 Florian Hotze under MIT License
*/

const { rules, triggers, items } = require('openhab');
const logger = require('openhab').log('Contacts-JS');

/*
This rule creates the roofwindows' states out of the three contacts.
It requires the following items (<room_1> should be replaced):
  "<room_1>_Dachfenster_zu"         as input
  "<room_1>_Dachfenster_klLueftung" as input
  "<room_1>_Dachfenster_grLueftung" as input
  "<room_1>_Dachfenster_Status"     as textual output
  "<room_1>_Dachfenster_Status_num" as numeric output
*/
rules.JSRule({
  name: 'Kontakte: Dachfenster Status',
  description: 'Generiert den Textstatus aus den Kontakten.',
  triggers: [
    triggers.GenericCronTrigger('0 0/5 * * * *'),
    triggers.GroupStateChangeTrigger('Kontakte')
  ],
  execute: data => {
    const roomList = []; // String Array with room base names.
    for (let i = 0; i < roomList.length; i++) {
      let outText;
      let outInt;
      const stateZu = items.getItem(roomList[i] + '_Dachfenster_zu').state;
      const stateKlLueftung = items.getItem(roomList[i] + '_Dachfenster_klLueftung').state;
      const stateGrLueftung = items.getItem(roomList[i] + '_Dachfenster_grLueftung').state;
      // checks for the different states.
      if (stateZu === 'CLOSED' && stateKlLueftung === 'CLOSED' && stateGrLueftung === 'CLOSED') { // geschlossen
        outText = 'geschlossen';
        outInt = 1;
      } else if (stateZu === 'OPEN' && stateKlLueftung === 'CLOSED' && stateGrLueftung === 'CLOSED') { // kleine Lüftung
        outText = 'kleine Lüftung';
        outInt = 0.6;
      } else if (stateZu === 'OPEN' && stateKlLueftung === 'OPEN' && stateGrLueftung === 'CLOSED') { // große Lüftung
        outText = 'große Lüftung';
        outInt = 0.3;
      } else if (stateZu === 'OPEN' && stateKlLueftung === 'OPEN' && stateGrLueftung === 'OPEN') { // ganz geöffnet
        outText = 'ganz geöffnet';
        outInt = 0;
      } else {
        outText = 'Fehler!';
        outInt = 0;
      }
      items.getItem(roomList[i] + '_Fenster_Status').postUpdate(outText);
      items.getItem(roomList[i] + '_Fenster_Status_num').postUpdate(outInt);
    }
  },
  id: 'dachfenster-status'
});

logger.info('Script loaded.');
