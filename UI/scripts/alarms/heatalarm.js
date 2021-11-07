/*
This script contains the logic for the heatalarms and sends the notifications.
Configuration on top of the file.
Dependencies:
 - groupUtils & timerMgr from https://github.com/rkoshak/openhab-rules-tools.
 - Group "Temperature" with items in scheme <room>_Temperatur.
The "Unique ID" of this script should be: "heatalarm-script".

Copyright (c) 2021 Florian Hotze under MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

/*
Configuration
*/
// Time until an alarm is sent.
var klLueftungTime = 30;
var grLueftungTime = 25;
var openTime = 15;
var warningTime = 20; // Time to add when its only a warning.
// Temperature treshold, positive values mean inside temp to outside. Example: 2 means at least 2 degress higher temp on the outside.
var tempTreshold = 2;
// Configuration of the itemnames.
var groupname = 'KontakteAufZu';
var roofwindowString = 'Dachfenster';
var tempOut = itemRegistry.getItem('Aussentemperatur').getState();
var heatLevelItem = 'Hitze_Stufe';

/*
Script starts here. Do not modify.
*/
this.OPENHAB_CONF = (this.OPENHAB_CONF === undefined) ? java.lang.System.getenv('OPENHAB_CONF') : this.OPENHAB_CONF;
load(OPENHAB_CONF + '/automation/lib/javascript/community/timerMgr.js');
load(OPENHAB_CONF + '/automation/lib/javascript/community/groupUtils.js');
// Only create a new manager if one doesn't already exist or else it will be wiped out each time the rule runs.
this.tm = (this.tm === undefined) ? new TimerMgr() : this.tm;

var logger = Java.type('org.slf4j.LoggerFactory').getLogger('org.openhab.rule.' + ctx.ruleUID);
var NotificationAction = Java.type('org.openhab.io.openhabcloud.NotificationAction');

/**
 * Send the notification.
 *
 * @param {string} itemLabel The label of the item, therfore the name of the window/door.
 */
function NotificationWarning (itemLabel) {
  logger.debug('Sending notification: "' + itemLabel + ' schließen, zu warm zum Lüften!"');
  NotificationAction.sendBroadcastNotification(itemLabel + ' schließen, zu warm zum Lüften!');
}
function NotificationAlarm (itemLabel) {
  logger.debug('Sending notification: ' + 'Hitzealarm: "' + itemLabel + ' schließen, zu warm zum Lüften!"');
  NotificationAction.sendBroadcastNotification('Hitzealarm: ' + itemLabel + ' schließen, zu warm zum Lüften!');
}

/**
 * Check whether the temperature difference from inside to outside is larger than tempTreshold.
 * This works by extracting the roomname from the itemname and getting the temperature of that room.
 *
 * @param {string} contactItem Name of the contact item.
 * @returns {boolean} Whether treshold is reached.
 */
function TemperatureDifference (contactItem) {
  var tempInItem = contactItem.split('_')[0];
  tempInItem = tempInItem + '_Temperatur';
  // Check whether item exists, if not -1 it is member of temperature group.
  var tempCheck = getMembersNames('Temperature').indexOf(tempInItem);
  // Calculate difference, inside to outside.
  var bool;
  if (tempCheck !== -1) {
    var tempIn = itemRegistry.getItem(tempInItem).getState();
    var diff = tempOut - tempIn;
    if (diff >= tempTreshold) {
      bool = true;
    } else {
      bool = false;
    }
  } else {
    bool = true;
  }
  return bool;
}

/**
 * Alarm manager
 * It checks the requirements and schedules an alarm.
 * When an alarm is already scheduled, no new alarm will be scheduled.
 *
 * @param {string} contactItem Name of the contact item.
 * @param {number} timerDuration Minutes for the timer.
 */
function StartWarning (contactItem, timerDuration) {
  var heatLevel = itemRegistry.getItem(heatLevelItem).getState().toBigDecimal();
  var itemLabel = itemRegistry.getItem(contactItem).getLabel();
  var diff = TemperatureDifference(contactItem);
  // Check heat level and temperature difference before scheduling alarm.
  if ((heatLevel >= 1) && (diff === true)) {
    // Function generator for the timerOver actions.
    function timerOver (contactItem, itemLabel, heatLevelItem) {
      return function () {
        var contactState = itemRegistry.getItem(contactItem).getState().toString();
        var heatLevel = itemRegistry.getItem(heatLevelItem).getState().toBigDecimal();
        var diff = TemperatureDifference(contactItem);
        logger.info('The timer is over. Contact item is: ' + contactItem + ' temp treshold reached: ' + diff);
        // Check heat level and temperature difference on alarm execution.
        if ((contactState === 'OPEN') && (diff === true)) {
          if (heatLevel === 4) {
            NotificationAlarm(itemLabel);
          } else if (heatLevel >= 1) {
            NotificationWarning(itemLabel);
          }
        }
      };
    }
    // Generate the timer time, if heatLevel is not 4 (alarm) add time.
    var timerTime;
    if (heatLevel === 4) {
      timerTime = timerDuration + 'm';
    } else {
      timerTime = timerDuration + warningTime + 'm';
    }
    // Create the timer.
    if (this.tm.hasTimer(contactItem)) {
      logger.debug('Timer for "' + contactItem + '" already exists, skipping!');
    } else {
      this.tm.check(contactItem, timerTime, timerOver(contactItem, itemLabel, heatLevelItem));
      logger.info('Created timer "' + contactItem + '"; time: ' + timerTime);
    }
  }
}

/**
 * Get the state of a roowindow and call the alarm manager.
 * When a window is closed, cancel the alarm.
 *
 * @param {string} item Name of the item.
 */
function RoofwindowAlarm (item) {
  // Remove the suffix.
  item = item.replace('_zu', '');
  item = item.replace('_klLueftung', '');
  item = item.replace('_grLueftung', '');
  // Retrieve the contact states from openHAB.
  var StateZu = itemRegistry.getItem(item + '_zu').getState().toString();
  var StateKlLueftung = itemRegistry.getItem(item + '_klLueftung').getState().toString();
  var StateGrLueftung = itemRegistry.getItem(item + '_grLueftung').getState().toString();
  // Checks for the different states.
  if (StateZu === 'OPEN' && StateKlLueftung === 'OPEN' && StateGrLueftung === 'OPEN') { // ganz geöffnet
    StartWarning(item + '_zu', openTime);
  } else if (StateZu === 'OPEN' && StateKlLueftung === 'OPEN' && StateGrLueftung === 'CLOSED') { // große Lüftung
    StartWarning(item + '_zu', grLueftungTime);
  } else if (StateZu === 'OPEN' && StateKlLueftung === 'CLOSED' && StateGrLueftung === 'CLOSED') { // kleine Lüftung
    StartWarning(item + '_zu', klLueftungTime);
  } else if (StateZu === 'CLOSED' && StateKlLueftung === 'CLOSED' && StateGrLueftung === 'CLOSED') { // geschlossen
    if (this.tm.hasTimer(item + '_zu')) {
      logger.info('Cancelling timer for "' + item + '_zu", contact closed.');
      this.tm.cancel(item + '_zu');
    }
  }
}

/**
 * Get the state of a normal window or door and call the alarm manager.
 * When a window is closed, cancel the alarm.
 *
 * @param {string} contactItem Name of the item.
 */
function SingleContact (contactItem) {
  // Retrieve the contact state from openHAB.
  var stateSingle = itemRegistry.getItem(contactItem).getState().toString();
  if (stateSingle === 'OPEN') {
    StartWarning(contactItem, openTime);
  } else if (stateSingle === 'CLOSED') {
    if (this.tm.hasTimer(contactItem)) {
      logger.info('Cancelling timer for "' + contactItem + '", contact closed.');
      this.tm.cancel(contactItem);
    }
  }
}

var groupMembers = getMembersNames(groupname);
for (var index in groupMembers) {
  // Check whether itemname contains variable roofwindowString.
  var b = groupMembers[index].search(roofwindowString);
  if ((b !== -1) &&
  (groupMembers[index] !== 'Treppenhaus_Dachfenster_zu')) { // Additional check to filter a single window.
    logger.debug('Checking roofindow: ' + groupMembers[index]);
    RoofwindowAlarm(groupMembers[index]);
  } else {
    logger.debug('Checking single contact: ' + groupMembers[index]);
    SingleContact(groupMembers[index]);
  }
}
