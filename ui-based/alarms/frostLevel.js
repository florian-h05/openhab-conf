/*
This script contains the logic for the frostalarm. It updates the frost level item.
Configuration in lines 10 + 11.
The "Unique ID" of this script should be: "frostLevel-script".
Copyright (c) 2021 Florian Hotze under MIT License
*/

var logger = Java.type('org.slf4j.LoggerFactory').getLogger('org.openhab.rule.' + ctx.ruleUID)

// set your itemnames
var temp = itemRegistry.getItem('Aussentemperatur').getState()
var activated = itemRegistry.getItem('Frostalarm_send').getState().toString()

var frostLevelPrev = itemRegistry.getItem('Frost_Stufe').getState()
var frostLevel
// warnings can be turned off & on
if (activated === 'ON') {
  if ((temp <= 12) && (temp > 5)) {
    frostLevel = 1 // warning
  } else if ((temp <= 5) && (temp > 3)) {
    frostLevel = 1 // warning
  }
} else if (activated === 'OFF') {
  frostLevel = 0
}
// alarms could not be deactivated
if (temp <= 3) {
  frostLevel = 4 // alarm
} else if (temp > 12) {
  frostLevel = 0 // nothing
}
if (frostLevelPrev != frostLevel) {
  logger.info('frostLevel changed from ' + frostLevelPrev + ' to ' + frostLevel)
}
events.postUpdate('Frost_Stufe', frostLevel)
