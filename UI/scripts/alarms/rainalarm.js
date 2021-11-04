/*
This script contains the logic for the rainalarms and sends the notifications.
Configuration:
 - Groupname of items to run the rainalarm on.
 - Names of weather items and wind tresholds on top.
 - Names of roofwindow items on top.
 - String in roofwindow item names.
Dependencies:
 - groupUtils (For more information have a look at the repo.)
Note:
 - One item is filtered out of the alarm, have a look at the end of file.
The "Unique ID" of this script should be: "rainalarm-script".
How it works: it is called by a script in a rule with the following parameters:
  - this.mode (values: 'onChange', else check all contacts (like 'onAlarm'))
  - this.triggeringItem (value: when script called onChange the name of the item that changed)

Copyright (c) 2021 Florian Hotze under MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

/**
 * Configuration
 */
var groupname = 'KontakteAufZu';
var roofwindowString = 'Dachfenster';
// Set your itemnames.
var rain = itemRegistry.getItem('Regenalarm').getState().toString(); // raining == OPEN
var wind = itemRegistry.getItem('Windgeschwindigkeit').getState(); // in m/s
// Configuration of windspeed limits for roofwindows that are not completely open.
var klStufe = 12;
var grStufe = 7;

/**
 * Rule starts here.
 */
this.OPENHAB_CONF = (this.OPENHAB_CONF === undefined) ? java.lang.System.getenv('OPENHAB_CONF') : this.OPENHAB_CONF;
load(OPENHAB_CONF + '/automation/lib/javascript/community/groupUtils.js');
var logger = Java.type('org.slf4j.LoggerFactory').getLogger('org.openhab.rule.' + ctx.ruleUID);
var NotificationAction = Java.type('org.openhab.io.openhabcloud.NotificationAction');
var HTTP = Java.type('org.openhab.core.model.script.actions.HTTP');

// Send the notification.
function Notification (itemLabel, messageText) {
  NotificationAction.sendBroadcastNotification('Achtung! Regenalarm: ' + itemLabel + ' ' + messageText + '!');
}

// Rainalarm for roofwindow. The state of the window is built out of three contacts. Called with the room name.
function RoofwindowAlarm (item) {
  // Remove the suffix.
  item = item.replace('_zu', '');
  item = item.replace('_klLueftung', '');
  item = item.replace('_grLueftung', '');
  // Retrieve the contact states from openHAB.
  var StateZu = itemRegistry.getItem(item + '_zu').getState().toString();
  var StateKlLueftung = itemRegistry.getItem(item + '_klLueftung').getState().toString();
  var StateGrLueftung = itemRegistry.getItem(item + '_grLueftung').getState().toString();
  var itemLabel = itemRegistry.getItem(item + '_zu').getLabel();
  // Check for rain.
  if (rain === 'OPEN') { // active alarm === OPEN
    // Checks for the different states.
    if (StateZu === 'CLOSED' && StateKlLueftung === 'OPEN' && StateGrLueftung === 'OPEN' && wind >= klStufe) { // kleine Lüftung
      Notification(itemLabel, 'kleine Lüftung');
    } else if (StateZu === 'CLOSED' && StateKlLueftung === 'CLOSED' && StateGrLueftung === 'OPEN' && wind >= grStufe) { // große Lüftung
      Notification(itemLabel, 'große Lüftung');
    } else if (StateZu === 'CLOSED' && StateKlLueftung === 'CLOSED' && StateGrLueftung === 'CLOSED') { // ganz geöffnet
      Notification(itemLabel, 'ganz geöffnet');
    }
  }
}

// Rainalarm for windows with a single contact. Called with the contact item.
function SingleContact (contactItem) {
  // Retrieve the contact state from openHAB.
  var StateSingle = itemRegistry.getItem(contactItem).getState().toString();
  var itemLabel = itemRegistry.getItem(contactItem).getLabel();
  logger.debug('Checking single contact: item: ' + contactItem + ' label: ' + itemLabel + ' state: ' + StateSingle);
  // Check for rain.
  if (rain === 'OPEN') { // active alarm === OPEN
    if (StateSingle === 'CLOSED') { // open contact == CLOSED
      Notification(itemLabel, 'geöffnet');
    }
  }
}

if (this.mode === 'onChange') {
  // Check whether itemname contains variable roofwindowString.
  logger.info('Mode is: onChange');
  var b = this.triggeringItem.search(roofwindowString);
  if ((b !== -1) &&
  (this.triggeringItem !== 'Treppenhaus_Dachfenster_zu')) { // Additional check for my special window that closes automatically on rain.
    logger.debug('Checking roofindow: ' + this.triggeringItem);
    RoofwindowAlarm(this.triggeringItem);
  } else {
    logger.debug('Checking single contact: ' + this.triggeringItem);
    SingleContact(this.triggeringItem);
  }
} else {
  logger.info('Mode is: onAlarm or on manual execution');
  var groupMembers = getMembersNames(groupname);
  for (var index in groupMembers) {
    // Check whether itemname contains variable roofwindowString.
    var c = groupMembers[index].search(roofwindowString);
    if ((c !== -1) &&
    (groupMembers[index] !== 'Treppenhaus_Dachfenster_zu')) { // Additional check for my special window that closes automatically on rain.
      logger.debug('Checking roofindow: ' + groupMembers[index]);
      RoofwindowAlarm(groupMembers[index]);
    } else {
      logger.debug('Checking single contact: ' + groupMembers[index]);
      SingleContact(groupMembers[index]);
    }
  }
}
