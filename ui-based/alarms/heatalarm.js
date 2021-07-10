/*
This script contains the logic for the rainalarms and sends the notifications.
Configuration:
 - Names of items in lines 17-19 and treshold in line 15.
 - Names of roofwindow items in lines 106-123. String in roofwindow itemnames in line 145.
The "Unique ID" of this script should be: "heatalarm-script".
*/

// configuration of heatalarm
var klLueftungTime = 25
var grLueftungTime = 20
var openTime = 15
var warningTime = 10 // time to add when its only a warning
// Temperature treshold, positive values mean inside temp to outside. Example: 2 means at least 2 degress higher temp on the outside.
var tempTreshold = 2
// configuration of the itemnames
var tempOut = itemRegistry.getItem('Aussentemperatur').getState()
var heatLevelItem = 'Hitze_Stufe'
var contactGroup = 'KontakteAufZu'

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
function StartWarning (contactItem, timerDuration) {
  var heatLevel = itemRegistry.getItem(heatLevelItem).getState().toString()
  var itemLabel = itemRegistry.getItem(contactItem).getLabel()
  var diff = TemperatureDifference(contactItem)
  if ((heatLevel >= 1) && (diff === true)) {
    // Function generator for the timerOver actions.
    function timerOver (contactItem, itemLabel, heatLevelItem) {
      logger.info('Creating timer "' + contactItem + '" time: ' + timerTime)
      return function () {
        var contactState = itemRegistry.getItem(contactItem).getState().toString()
        var heatLevel = itemRegistry.getItem(heatLevelItem).getState().toString()
        var diff = TemperatureDifference(contactItem)
        logger.info('The timer is over. Contact item is: '+ contactItem + ' temp treshold reached: ' + diff)
        if ((contactState === 'CLOSED') && (diff === true)) {
          if (heatLevel == 4) {
            NotificationAlarm(itemLabel)
          } else if (heatLevel >= 1) {
            NotificationWarning(itemLabel)
        }
      }
      }
    }
    // Generate the timer time, if heatLevel is not 4 (alarm) then add time
    if (heatLevel == 4) {
      var timerTime = timerDuration + 'm'
    } else {
      var timerTime = timerDuration + warningTime + 'm'
    }
    // Create the Timer
    if (this.tm.hasTimer(contactItem)) {
      logger.info('Timer for "' + contactItem + '" already exists, skipping!')
    } else {
      this.tm.check(contactItem, timerTime, timerOver(contactItem, itemLabel, heatLevelItem))
    } 
  }
}

// Rainalarm for roofwindow. The state of the window is built out of three contacts. Called with the room name.
function RoofwindowAlarm (item) {
  // remove the suffix
  item = item.replace('_zu', '')
  item = item.replace('_klLueftung', '')
  item = item.replace('_grLueftung', '')
  // retrieve the contact states from openHAB
  var StateZu = itemRegistry.getItem(item + '_zu').getState().toString()
  var StateKlLueftung = itemRegistry.getItem(item + '_klLueftung').getState().toString()
  var StateGrLueftung = itemRegistry.getItem(item + '_grLueftung').getState().toString()
  // checks for the different states.
  if (StateZu === 'CLOSED' && StateKlLueftung === 'CLOSED' && StateGrLueftung === 'CLOSED') { // ganz geöffnet
    StartWarning(item + '_zu', openTime)
  } else if (StateZu === 'CLOSED' && StateKlLueftung === 'CLOSED' && StateGrLueftung === 'OPEN') { // große Lüftung
    StartWarning(item + '_zu', grLueftungTime)
  } else if (StateZu === 'CLOSED' && StateKlLueftung === 'OPEN' && StateGrLueftung === 'OPEN') { // kleine Lüftung
    StartWarning(item + '_zu', klLueftungTime)
  } else if (StateZu === 'OPEN') { // ganz geschlossen
    if ( this.tm.hasTimer(item + '_zu') ) {
      logger.info('Cancelling timer for "' + item + '_zu", contact closed.')
      this.tm.cancel(item + '_zu')
    }
  }
}

// Heatalarm for windows with a single contact. Called with the contact item.
function SingleContact (contactItem) {
  // retrieve the contact state from openHAB
  var StateSingle = itemRegistry.getItem(contactItem).getState().toString()
  if (StateSingle === 'CLOSED') {
    StartWarning(contactItem, openTime)
  } else if (StateSingle === 'OPEN') {
    if ( this.tm.hasTimer(contactItem) ) {
      logger.info('Cancelling timer for "' + contactItem + '", contact closed.')
      this.tm.cancel(contactItem)
    }
  }
}

var groupMembers = GroupUtils.getMembers(contactGroup)
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
