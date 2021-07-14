/*
This script generates a alarm status overview string.
Configuration of itemnames in lines 11-14 + 34.
The "Unique ID" of this script should be: "alarm-status-string-script".
Copyright (c) 2021 Florian Hotze under MIT License
*/

var logger = Java.type('org.slf4j.LoggerFactory').getLogger('org.openhab.rule.' + ctx.ruleUID)

var statusString = '' // contains the generated script
var contacts = itemRegistry.getItem('Kontakte').getState().toString()
var rain = itemRegistry.getItem('Regenalarm').getState().toString()
var heatLevel = itemRegistry.getItem('Hitze_Stufe').getState()
var frostLevel = itemRegistry.getItem('Frost_Stufe').getState()

if (contacts === 'CLOSED') {
  if (rain === 'OPEN') {
    statusString = statusString + 'Regen! '
  }
  if (heatLevel === 4) {
    statusString = statusString + 'Hitze! '
  } else if (heatLevel >= 1) {
    statusString = statusString + 'Wärme beachten. '
  }
  if (frostLevel === 4) {
    statusString = statusString + 'Frost! '
  } else if (frostLevel >= 1) {
    statusString = statusString + 'Kälte beachten. '
  }
} else if (contacts === 'OPEN') {
  statusString = ''
}

events.postUpdate('Alarm_Status', statusString)
