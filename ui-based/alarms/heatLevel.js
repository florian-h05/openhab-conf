/*
This script contains the logic for the heatalarm. It updates the heat level item.
Configuration in lines 11 + 12.
The "Unique ID" of this script should be: "heatLevel-script".
Copyright (c) 2021 Florian Hotze under MIT License
*/

var logger = Java.type('org.slf4j.LoggerFactory').getLogger('org.openhab.rule.' + ctx.ruleUID)

// set your itemnames
var temp = itemRegistry.getItem('Aussentemperatur').getState()
var activated = itemRegistry.getItem('Hitzealarm_send').getState().toString()

var heatLevelPrev = itemRegistry.getItem('Hitze_Stufe').getState()
var heatLevel
// warnings can be turned off & on
if (activated === 'ON') {
  if ((temp >= 25) && (temp < 28)) {
    heatLevel = 1 // warning
  } else if ((temp >= 28) && (temp < 32)) {
    heatLevel = 2 // warning
  }
} else if (activated === 'OFF') {
  heatLevel = 0 // nothing
}
// alarms could not be deactivated
if (temp >= 32) {
  heatLevel = 4 // alarm
} else if (temp < 25) {
  heatLevel = 0 // nothing
}

if (heatLevelPrev != heatLevel) {
  logger.info('heatLevel changed from "' + heatLevelPrev + '" to "' + heatLevel + '"')
}
events.postUpdate('Hitze_Stufe', heatLevel)
