/*
This script logs knx automatic enable/disable to the InfluxDB smarthome log.
No configuration needed. This script gets the rule triggering item.
Requires items to start with the roomname before _. Example: livingRoom_automatic-disable
This script is used directly in the rule.
Copyright (c) 2021 Florian Hotze under MIT License
*/

var logger = Java.type('org.slf4j.LoggerFactory').getLogger('org.openhab.rule.' + ctx.ruleUID)
var Exec = Java.type('org.openhab.core.model.script.actions.Exec')
var Duration = Java.type('java.time.Duration')

function logAutomatic (itemName) {
  var actualState = itemRegistry.getItem(itemName).getState()
  // logger.info(itemName + ' actual state is: ' + actualState)
  var roomName = itemName.split('_')[0];
  // check the state and log
  if (actualState === ON) {
    Exec.executeCommandLine(Duration.ofSeconds(30), '/usr/bin/python3', '/etc/openhab/scripts/openhab-log-influxdb.py', '-t knx', '-d ' + roomName, '-l Automatik deaktiviert.')
    // logger.info('logged ' + roomName + ' automatic off to the smarthome-log')
  }
  if (actualState === OFF) {
    Exec.executeCommandLine(Duration.ofSeconds(30), '/usr/bin/python3', '/etc/openhab/scripts/openhab-log-influxdb.py', '-t knx', '-d ' + roomName, '-l Automatik aktiviert.')
    // logger.info('logged ' + roomName + ' automatic on to the smarthome-log')
  }
}

logAutomatic(event.itemName)
