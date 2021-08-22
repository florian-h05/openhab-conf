/*
This script logs knx shading to the InfluxDB smarthome log.
Configure the suffix of the shading state item in line 15. 
This script gets the rule triggering item.
This script is used directly in the rule.
Copyright (c) 2021 Florian Hotze under MIT License
*/

var logger = Java.type('org.slf4j.LoggerFactory').getLogger('org.openhab.rule.' + ctx.ruleUID)
var Exec = Java.type('org.openhab.core.model.script.actions.Exec')
var Duration = Java.type('java.time.Duration')

function logShading (itemName) {
  var actualState = itemRegistry.getItem(itemName).getState()
  // logger.info(itemName + ' actual state is: ' + actualState)
  var deviceName = itemName.replace('_BeschStat', '')
  if (actualState === ON) {
    Exec.executeCommandLine(Duration.ofSeconds(30), '/usr/bin/python3', '/etc/openhab/scripts/openhab-log-influxdb.py', '-t knx', '-d ' + deviceName, '-l Aut. Verschattung aktiviert.')
    // logger.info('logged ' + deviceName + ' shading on to the smarthome-log')
  }
  if (actualState === OFF) {
    Exec.executeCommandLine(Duration.ofSeconds(30), '/usr/bin/python3', '/etc/openhab/scripts/openhab-log-influxdb.py', '-t knx', '-d ' + deviceName, '-l Aut. Verschattung deaktiviert.')
    // logger.info('logged ' + deviceName + ' shading off to the smarthome-log')
  }
}

logShading(event.itemName)
