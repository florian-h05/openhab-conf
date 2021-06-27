/*
This script contains the logic for the rainalarms and sends the notifications.
Configuration:
 - Names of items in lines 16-19 and treshold in line 15.
 - Names of roofwindow items in lines 106-117. String in roofwindow itemnames in line 135.
The "Unique ID" of this script should be: "heatalarm-script".
*/

// configuration of heatalarm
var klLueftungTime = '2m'
var grLueftungTime = '20m'
var openTime = '15m'
// Temperature treshold, positive values mean inside temp to outside. Example: 2 means at least 2 degress higher temp on the outside.
var tempTreshold = 2
// configuration of the itemnames
var tempOut = itemRegistry.getItem('Aussentemperatur').getState()
var heatLevelItem = 'Hitze_Stufe'
var contactGroup = 'KontakteAufZu'

// used global by several functions
var groupMembers

// load timer_mgr library
this.OPENHAB_CONF = (this.OPENHAB_CONF === undefined) ? java.lang.System.getenv("OPENHAB_CONF") : this.OPENHAB_CONF
load(OPENHAB_CONF+'/automation/lib/javascript/community/timerMgr.js')
load(OPENHAB_CONF+'/automation/lib/javascript/community/groupUtils.js')
var GroupUtils = new GroupUtils()
// Only create a new manager if one doesn't already exist or else it will be wiped out each time the rule runs
this.tm = (this.tm === undefined) ? new TimerMgr() : this.tm

var logger = Java.type('org.slf4j.LoggerFactory').getLogger('org.openhab.rule.' + ctx.ruleUID)
var NotificationAction = Java.type('org.openhab.io.openhabcloud.NotificationAction')

// send the notification
function NotificationWarning (itemLabel) {
  // logger.info('Sending notification: ' + itemLabel + ' schließen, zu warm zum Lüften!')
  NotificationAction.sendBroadcastNotification(itemLabel + ' schließen, zu warm zum Lüften!')
  // NotificationAction.sendNotification('e-mail', itemLabel + ' schließen, zu warm zum Lüften!')
}
function NotificationAlarm (itemLabel) {
  // logger.info('Sending notification: ' + 'Hitzealarm: ' + itemLabel + ' schließen, zu warm zum Lüften!')
  NotificationAction.sendBroadcastNotification('Hitzealarm: ' + itemLabel + ' schließen, zu warm zum Lüften!')
  // NotificationAction.sendNotification('e-mail', 'Hitzealarm: ' + itemLabel + ' schließen, zu warm zum Lüften!')
}

// check for the temperature difference
function TemperatureDifference (contactItem) {
  var tempInItem = contactItem.split('_')[0]
  tempInItem = tempInItem + '_Temperatur'
  // check whether item exists, if not -1 it is member of temperature group
  var tempCheck = GroupUtils.getMembers('Temperature').indexOf(tempInItem)
  // calculate difference, inside to outside
  if (tempCheck != -1) {
    var tempIn = itemRegistry.getItem(tempInItem).getState()
    var diff = tempOut - tempIn
    if (diff >= tempTreshold) {
      var bool = true
    } else {
      var bool = false
    }
  } else {
    bool = true
  }
  return bool
}

// check the status and start the timer for the notification
function StartWarning (contactItem, timerTime) {
  var heatLevel = itemRegistry.getItem(heatLevelItem).getState().toString()
  var itemLabel = itemRegistry.getItem(contactItem).getLabel()
  var diff = TemperatureDifference(contactItem)
  if ((heatLevel >= 1) && (diff === true)) {
    // Function generator for the timerOver actions.
    function timerOver (contactItem, itemLabel) {
      return function () {
        logger.info('The timer is over. Contact item is: '+ contactItem)
        var contactState = itemRegistry.getItem(contactItem).getState().toString()
        var heatLevel = itemRegistry.getItem(heatLevelItem).getState().toString()
        var diff = TemperatureDifference(contactItem)
        // logger.info(contactItem + ' temp treshold: ' + diff)
        if ((contactState === 'CLOSED') && (diff === true)) {
          if (heatLevel == 4) {
            NotificationAlarm(itemLabel)
          } else if (heatLevel >= 1) {
            NotificationWarning(itemLabel)
        }
      }
      }
    }
    // Create the Timer
    // logger.info('Creating timer "' + contactItem + '" time: ' + timerTime)
    this.tm.check(contactItem,
                 timerTime,
                 timerOver(contactItem, itemLabel),
                 false,
                 function () { logger.info('Timer for "' + contactItem + '" already exists, skipping!') })
  }
}

// Rainalarm for roofwindow. The state of the window is built out of three contacts. Called with the room name.
function RoofwindowAlarm (item) {
  // remove the suffix
  item = item.replace('_zu', '')
  item = item.replace('_klLueftung', '')
  // retrieve the contact states from openHAB
  var StateZu = itemRegistry.getItem(item + '_zu').getState().toString()
  var StateKlLueftung = itemRegistry.getItem(item + '_klLueftung').getState().toString()
  var StateGrLueftung = itemRegistry.getItem(item + '_grLueftung').getState().toString()
  // checks for the different states.
  if (StateZu === 'CLOSED' && StateKlLueftung === 'OPEN' && StateGrLueftung === 'OPEN') { // kleine Lüftung
    StartWarning(item + '_zu', klLueftungTime)
  } else if (StateZu === 'CLOSED' && StateKlLueftung === 'CLOSED' && StateGrLueftung === 'OPEN') { // große Lüftung
    StartWarning(item + '_zu', grLueftungTime)
  } else if (StateZu === 'CLOSED' && StateKlLueftung === 'CLOSED' && StateGrLueftung === 'CLOSED') { // ganz geöffnet
    StartWarning(item + '_zu', openTime)
  } else if (StateZu === 'OPEN') { // ganz geschlossen
    tm.cancel(item + '_zu')
  }
}

// Heatalarm for windows with a single contact. Called with the contact item.
function SingleContact (contactItem) {
  // retrieve the contact state from openHAB
  var StateSingle = itemRegistry.getItem(contactItem).getState().toString()
  if (StateSingle === 'CLOSED') {
    StartWarning(contactItem, openTime)
  } else if (StateSingle === 'OPEN') {
    tm.cancel(contactItem)
  }
}

var groupMembers= GroupUtils.getMembers(contactGroup)
for (var index in groupMembers) {
  // check whether itemname contains 'Dachfenster'
  var b = groupMembers[index].search('Dachfenster') 
  if (b != -1) {
    // logger.info('checking roofindow: ' + groupMembers[index])
    RoofwindowAlarm(groupMembers[index])
  } else {
    // logger.info('checking single contact: ' + groupMembers[index])
    SingleContact(groupMembers[index])
  }
}
