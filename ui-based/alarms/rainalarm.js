/*
This script contains the logic for the rainalarms and sends the notifications.
Configuration: 
 - Names of weather items in lines 21 + 22 and wind tresholds in lines 24 + 25.
 - Names of roofwindow items in lines 36-42.
 - Exclusive string in roofwindow itemnames in lines 73 + 86.
 - Groupname of the group of the main contacts that should be processed in line 103.
The "Unique ID" of this script should be: "rainalarm-script".
How it works: it is called by a script in a rule with the following parameters: 
  - this.mode (values: 'onChange', else check all contacts (like 'onAlarm'))
  - this.triggeringItem (value: when script called onChange the name of the item that changed)
*/

this.OPENHAB_CONF = (this.OPENHAB_CONF === undefined) ? java.lang.System.getenv("OPENHAB_CONF") : this.OPENHAB_CONF
load(OPENHAB_CONF+'/automation/lib/javascript/community/groupUtils.js')
var GroupUtils = new GroupUtils()
var logger = Java.type('org.slf4j.LoggerFactory').getLogger('org.openhab.rule.' + ctx.ruleUID)
var NotificationAction = Java.type('org.openhab.io.openhabcloud.NotificationAction')

// set your itemnames
var rain = itemRegistry.getItem('Regenalarm').getState().toString()
var wind = itemRegistry.getItem('Windgeschwindigkeit').getState()
// configuration of windspeed limits
var klStufe = 6
var grStufe = 3.5

// send the notification
function Notification (itemLabel, messageText) {
  NotificationAction.sendBroadcastNotification('Achtung! Regenalarm: ' + itemLabel + ' ' + messageText + '!')
  // NotificationAction.sendNotification('e-mail', 'Achtung! Regenalarm: ' + itemLabel + ' ' + messageText + '!')
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
  var itemLabel = itemRegistry.getItem(item + '_zu').getLabel()
  // checks for rain
  if (rain === 'OPEN') { // active alarm === OPEN
    // checks for the different states.
    if (StateZu === 'CLOSED' && StateKlLueftung === 'OPEN' && StateGrLueftung === 'OPEN' && wind >= klStufe) { // kleine Lüftung
      Notification(itemLabel, 'kleine Lüftung')
    } else if (StateZu === 'CLOSED' && StateKlLueftung === 'CLOSED' && StateGrLueftung === 'OPEN' && wind >= grStufe) { // große Lüftung
      Notification(itemLabel, 'große Lüftung')
    } else if (StateZu === 'CLOSED' && StateKlLueftung === 'CLOSED' && StateGrLueftung === 'CLOSED') { // ganz geöffnet
      Notification(itemLabel, 'ganz geöffnet')
    }
  }
}

// Rainalarm for windows with a single contact. Called with the contact item.
function SingleContact (contactItem) {
  // retrieve the contact state from openHAB
  var StateSingle = itemRegistry.getItem(contactItem).getState().toString()
  var itemLabel = itemRegistry.getItem(contactItem).getLabel()
  // logger.info('checking single contact: item: ' + contactItem + ' label: ' + itemLabel + ' state: ' + StateSingle)
  // check for rain
  if (rain === 'OPEN') { // active alarm === OPEN
    if (StateSingle === 'CLOSED') { // open contact == CLOSED
      Notification(itemLabel, 'geöffnet')
    }
  }
}

if (this.mode === 'onChange') {
  // check whether itemname contains 'Dachfenster'
  logger.info('mode is: onChange')
  var b = this.triggeringItem.search('Dachfenster') 
  if ((b != -1) && (this.triggeringItem !== 'Treppenhaus_Dachfenster_zu')) {
    // logger.info('checking roofindow: ' + this.triggeringItem)
    RoofwindowAlarm(this.triggeringItem)
  } else {
    // logger.info('checking single contact: ' + this.triggeringItem)
    SingleContact(this.triggeringItem)
  }
} else {
  logger.info('mode is: onAlarm or on manual execution')
  var groupMembers = GroupUtils.getMembers('KontakteAufZu')
  for (var index in groupMembers) {
    // check whether itemname contains 'Dachfenster'
    var b = groupMembers[index].search('Dachfenster') 
    if ((b != -1) && (groupMembers[index] !== 'Treppenhaus_Dachfenster_zu')) {
      // logger.info('checking roofindow: ' + groupMembers[index])
      RoofwindowAlarm(groupMembers[index])
    } else {
      // logger.info('checking single contact: ' + groupMembers[index])
      SingleContact(groupMembers[index])
    }
  }
}
