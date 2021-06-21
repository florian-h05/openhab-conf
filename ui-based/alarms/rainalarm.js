/*
This script contains the logic for the rainalarms and sends the notifications.
Configuration: 
 - Names of weather items in lines 17 + 18 and wind tresholds in lines 20 + 21.
 - Names of roofwindow items in lines 43-45.
 - Exclusive string in roofwindow itemnames in lines 106 + 118.
 - Groupname of the group of the main contacts that should be processed in line 103.
The "Unique ID" of this script should be: "rainalarm-script".
Requires items to start with the roomname before '_'.
How it works: it is called by a script in a rule with the following parameters: 
  - this.mode (values: 'onAlarm' & 'onChange')
  - this.triggeringItem (value: when script called onChange the name of the item that changed)
*/

// used global by several functions
var messageText, groupMembers

var logger = Java.type('org.slf4j.LoggerFactory').getLogger('org.openhab.rule.' + ctx.ruleUID)
var NotificationAction = Java.type('org.openhab.io.openhabcloud.NotificationAction')

// set your itemnames
var rain = itemRegistry.getItem('Regenalarm').getState().toString()
var wind = itemRegistry.getItem('Windgeschwindigkeit').getState()
// configuration of windspeed limits
var klStufe = 6
var grStufe = 3.5

// send the notification
function Notification (itemLabel) {
  NotificationAction.sendBroadcastNotification('Achtung! Regenalarm: ' + itemLabel + ' ' + messageText + '!')
  // NotificationAction.sendNotification('e-mail', 'Achtung! Regenalarm: ' + itemLabel + ' ' + messageText + '!')
}

// Extract the room's name from an itemname. The roomname must be the first string before _.
function extractRoom (contactItem) {
  var room = contactItem.split('_')
  return room[0]
}

// Rainalarm for roofwindow. The state of the window is built out of three contacts. Called with the room name.
function RoofwindowAlarm (currentRoom) {
  // set the itemnames of the contacts
  var ItemZu = currentRoom + '_Dachfenster_zu'
  var ItemKlLueftung = currentRoom + '_Dachfenster_klLueftung'
  var ItemGrLueftung = currentRoom + '_Dachfenster_grLueftung'
  // retrieve the contact states from openHAB
  var StateZu = itemRegistry.getItem(ItemZu).getState().toString()
  var StateKlLueftung = itemRegistry.getItem(ItemKlLueftung).getState().toString()
  var StateGrLueftung = itemRegistry.getItem(ItemGrLueftung).getState().toString()
  // logging for debug
  // logger.info('checking roofwindow: ' + ItemZu + ' state: ' + StateZu)
  // logger.info('checking roofwindow: ' + ItemKlLueftung + ' state: ' + StateKlLueftung)
  // logger.info('checking roofwindow: ' + ItemGrLueftung + ' state: ' + StateGrLueftung)
  if (rain === 'OPEN') { // active alarm === OPEN
    // checks for the different states.
    if (StateZu === 'CLOSED' && StateKlLueftung === 'OPEN' && StateGrLueftung === 'OPEN' && wind >= klStufe) { // kleine Lüftung
      messageText = 'kleine Lüftung'
      Notification(currentRoom + ' Dachfenster')
    } else if (StateZu === 'CLOSED' && StateKlLueftung === 'CLOSED' && StateGrLueftung === 'OPEN' && wind >= grStufe) { // große Lüftung
      messageText = 'große Lüftung'
      Notification(currentRoom + ' Dachfenster')
    } else if (StateZu === 'CLOSED' && StateKlLueftung === 'CLOSED' && StateGrLueftung === 'CLOSED') { // ganz geöffnet
      messageText = 'ganz geöffnet'
      Notification(currentRoom + ' Dachfenster')
    }
  }
}

// Rainalarm for windows with a single contact. Called with the contact item.
function SingleContact (contactItem) {
  // retrieve the contact state from openHAB
  var StateSingle = itemRegistry.getItem(contactItem).getState().toString()
  var itemLabel = itemRegistry.getItem(contactItem).getLabel
  // logger.info('checking single contact: item: ' + contactItem + ' label: ' + itemLabel + ' state: ' + StateSingle)
  // check for rain
  if (rain === 'OPEN') { // active alarm === OPEN
    if (StateSingle === 'CLOSED') {
      messageText = 'geöffnet'
      Notification(itemLabel)
    }
  }
}

// Get the members of a group. Call it with the group item's name.
function getGroupMembers (groupName) {
  var membersString = new String(ir.getItem(groupName).members)
  var membersSplit = membersString.split(' (')
  var firstMember = membersSplit[0].split('[')
  groupMembers = [firstMember[1]]
  // remove the first element
  membersSplit.splice(0, 1)
  // remove the last element
  membersSplit.splice(-1, 1)
  // iterate over the rest of membersSplit and add to groupMembers
  for (var index in membersSplit) {
    var nMember = membersSplit[index].split('), ')
    groupMembers.push(nMember[1])
  }
}

if (this.mode === 'onAlarm') {
  // logger.info('mode is: onAlarm')
  getGroupMembers('KontakteAufZu')
  for (var index in groupMembers) {
    // check whether itemname contains 'Dachfenster'
    var b = groupMembers[index].search('Dachfenster') 
    if (b != -1) {
      // logger.info('checking roofindow: ' + groupMembers[index])
      RoofwindowAlarm(extractRoom(groupMembers[index]))
    } else {
      // logger.info('checking single contact: ' + groupMembers[index])
      SingleContact(groupMembers[index])
    }
  }
} else if (this.mode === 'onChange') {
  // check whether itemname contains 'Dachfenster'
  // logger.info('mode is: onChange')
  var b = this.triggeringItem.search('Dachfenster') 
  if (b != -1) {
    // logger.info('checking roofindow: ' + this.triggeringItem)
    RoofwindowAlarm(extractRoom(this.triggeringItem))
  } else {
    // logger.info('checking single contact: ' + this.triggeringItem)
    SingleContact(this.triggeringItem)
  }
}
