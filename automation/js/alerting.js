const { rules, triggers, items, actions } = require('openhab');
const logger = require('openhab').log('alerting-JS');

// Rainalarm
rules.JSRule({
  name: 'Rainalarm',
  description: 'Send notification when window open while it rains.',
  triggers: [
    triggers.ItemStateChangeTrigger('Regenalarm'),
    triggers.GroupStateChangeTrigger('Kontakte')
  ],
  execute: data => {
    /**
    * Configuration
    */
    const groupname = 'KontakteAufZu';
    const roofwindowString = 'Dachfenster';
    const ignoreList = [];
    // Set your itemnames.
    const rain = items.getItem('Regenalarm').state; // raining == OPEN
    const wind = parseFloat(items.getItem('Windgeschwindigkeit').state); // in m/s
    // Configuration of windspeed limits for roofwindows that are not completely open.
    const klStufe = 12;
    const grStufe = 7;

    /**
     * Send the notification.
     *
     * @param {string} itemLabel Label of the contact item.
     * @param {string} messageText Part of the notification message.
     */
    const Notification = (itemLabel, messageText) => {
      actions.NotificationAction.sendBroadcastNotification('Achtung! Regenalarm: ' + itemLabel + ' ' + messageText + '!');
    };

    /**
     * Rainalarm for roofwindow.
     * The state of the window is built out of three contacts.
     *
     * @param {Item} item
     */
    const RoofwindowAlarm = (item) => {
      // Remove the suffix.
      const baseItem = item.name.replace('_zu', '').replace('_klLueftung', '').replace('_grLueftung', '');
      const label = items.getItem(baseItem + '_zu').label;
      // Retrieve the contact states from openHAB.
      const StateZu = items.getItem(baseItem + '_zu').state;
      const StateKlLueftung = items.getItem(baseItem + '_klLueftung').state;
      const StateGrLueftung = items.getItem(baseItem + '_grLueftung').state;
      // Check for rain.
      if (rain === 'OPEN') { // active alarm === OPEN
        // Checks for the different states.
        if (StateZu === 'OPEN' && StateKlLueftung === 'CLOSED' && StateGrLueftung === 'CLOSED' && wind >= klStufe) { // kleine Lüftung
          Notification(label, 'kleine Lüftung');
        } else if (StateZu === 'OPEN' && StateKlLueftung === 'OPEN' && StateGrLueftung === 'CLOSED' && wind >= grStufe) { // große Lüftung
          Notification(label, 'große Lüftung');
        } else if (StateZu === 'OPEN' && StateKlLueftung === 'OPEN' && StateGrLueftung === 'OPEN') { // ganz geöffnet
          Notification(label, 'ganz geöffnet');
        }
      }
    };

    /**
     * Rainalarm for single contact.
     *
     * @param {Item} item
     */
    const SingleContact = (item) => {
      // Check for rain.
      if (rain === 'OPEN') { // active alarm === OPEN
        if (item.state === 'OPEN') {
          Notification(item.label, 'geöffnet');
        }
      }
    };

    const triggerItem = items.getItem(data.itemName);
    if (triggerItem.name === 'Regenalarm') {
      // Rainalarm triggered.
      logger.info('Rainalarm: Mode is: onAlarm or on manual execution');
      const groupMembers = items.getItem(groupname).members;
      for (let i = 0; i < groupMembers.length; i++) {
        // Check whether itemname is member of array ignoreList.
        if (ignoreList.indexOf(groupMembers[i].name) === -1) {
          // Check whether itemname contains variable roofwindowString.
          if (groupMembers[i].name.search(roofwindowString) !== -1) {
            logger.info('Rainalarm: Checking roofindow [{}].', groupMembers[i].name);
            RoofwindowAlarm(groupMembers[i]);
          } else {
            logger.info('Rainalarm: Checking single contact: [{}].', groupMembers[i].name);
            SingleContact(groupMembers[i]);
          }
        }
      }
    } else {
      // Member of Kontakte changed.
      // Check whether itemname contains variable roofwindowString.
      logger.info('Rainalarm: Mode is: onChange, item [{}].', triggerItem.name);
      // Check whether itemname is member of array ignoreList.
      if (ignoreList.indexOf(triggerItem.name) === -1) {
        // Check whether itemname contains variable roofwindowString.
        if (triggerItem.name.search(roofwindowString) !== -1) {
          logger.info('Rainalarm: Checking roofindow [{}].', triggerItem.name);
          RoofwindowAlarm(triggerItem);
        } else {
          logger.info('Rainalarm: Checking single contact: [{}].', triggerItem.name);
          SingleContact(triggerItem);
        }
      }
    }
  },
  id: 'rainalarm'
});

// Generates an alarm status string.
rules.JSRule({
  name: 'Alarm Status String Summary',
  description: 'Summarize alarms.',
  triggers: [
    triggers.SystemStartlevelTrigger(100),
    triggers.GenericCronTrigger('0 0/5 * * * *'),
    triggers.ItemStateChangeTrigger('Kontakte'),
    triggers.ItemStateChangeTrigger('Regenalarm'),
    triggers.ItemStateChangeTrigger('Hitze_Stufe'),
    triggers.ItemStateChangeTrigger('Frost_Stufe')
  ],
  execute: data => {
    const contacts = items.getItem('Kontakte').state;
    const rain = items.getItem('Regenalarm').state;
    const heatLevel = parseInt(items.getItem('Hitze_Stufe').state);
    const frostLevel = parseInt(items.getItem('Frost_Stufe').state);

    let statusString = '';
    if (contacts === 'OPEN') {
      if (rain === 'OPEN') {
        statusString = statusString + 'Regen! ';
      }
      if (heatLevel === 4) {
        statusString = statusString + 'Hitze! ';
      } else if (heatLevel >= 1) {
        statusString = statusString + 'Wärme beachten. ';
      }
      if (frostLevel === 4) {
        statusString = statusString + 'Frost! ';
      } else if (frostLevel >= 1) {
        statusString = statusString + 'Kälte beachten. ';
      }
    } else if (contacts === 'OPEN') {
      statusString = '';
    }
    // Post string to openHAB item.
    items.getItem('Alarm_Status').postUpdate(statusString);
  },
  id: 'alarm-status-string'
});

// Generates the frost level.
rules.JSRule({
  name: 'Frost Level',
  description: 'Determines the level of frost.',
  triggers: [
    triggers.SystemStartlevelTrigger(100),
    triggers.ItemStateChangeTrigger('Aussentemperatur'),
    triggers.ItemCommandTrigger('Frostalarm_send')
  ],
  execute: data => {
    const temp = parseFloat(items.getItem('Aussentemperatur').state);
    const activate = items.getItem('Frostalarm_send').state === 'ON';
    const frostLevelPrev = parseInt(items.getItem('Frost_Stufe').state);
    let frostLevel;
    if (activate === true) {
      if ((temp <= 12) && (temp > 5)) {
        frostLevel = 1; // warning
      } else if ((temp <= 5) && (temp > 2)) {
        frostLevel = 3; // warning
      }
    } else if (activate === false) {
      frostLevel = 0;
    }
    // alarms could not be deactivated
    if (temp <= 2) {
      frostLevel = 4; // alarm
    } else if (temp > 12) {
      frostLevel = 0; // nothing
    }
    if (frostLevelPrev !== frostLevel) {
      logger.info('frostLevel changed from ' + frostLevelPrev + ' to ' + frostLevel);
      items.getItem('Frost_Stufe').postUpdate(frostLevel);
    }
  },
  id: 'frostLevel'
});

// Generates the heat level.
rules.JSRule({
  name: 'Heat Level',
  description: 'Determines the level of heat.',
  triggers: [
    triggers.SystemStartlevelTrigger(100),
    triggers.ItemStateChangeTrigger('Aussentemperatur'),
    triggers.ItemCommandTrigger('Hitzealarm_send')
  ],
  execute: data => {
    const temp = parseFloat(items.getItem('Aussentemperatur').state);
    const activate = items.getItem('Hitzealarm_send').state === 'ON';
    const heatLevelPrev = parseInt(items.getItem('Hitze_Stufe').state);
    let heatLevel;
    // warnings can be turned off & on
    if (activate === 'ON') {
      if ((temp >= 25) && (temp < 28)) {
        heatLevel = 1; // warning
      } else if ((temp >= 28) && (temp < 32)) {
        heatLevel = 2; // warning
      }
    } else if (activate === 'OFF') {
      heatLevel = 0; // nothing
    }
    // alarms could not be deactivated
    if (temp >= 32) {
      heatLevel = 4; // alarm
    } else if (temp < 25) {
      heatLevel = 0; // nothing
    }
    if (heatLevelPrev !== heatLevel) {
      logger.info('heatLevel changed from ' + heatLevelPrev + ' to ' + heatLevel);
      items.getItem('Hitze_Stufe').postUpdate(heatLevel);
    }
  },
  id: 'heatLevel'
});

logger.info('Script loaded.');
