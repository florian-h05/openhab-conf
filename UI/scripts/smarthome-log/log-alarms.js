/*
This script logs alarms to the InfluxDB smarthome log.
No configuration needed. This script gets the rule triggering item.
This script is used directly in the rule.
Copyright (c) 2021 Florian Hotze under MIT License
*/

var logger = Java.type('org.slf4j.LoggerFactory').getLogger('org.openhab.rule.' + ctx.ruleUID)
var Exec = Java.type('org.openhab.core.model.script.actions.Exec')
var Duration = Java.type('java.time.Duration')

function logAlarm (itemName) {
  var actualState = itemRegistry.getItem(itemName).getState()
  // logger.info(itemName + ' actual state is: ' + actualState)
  if (actualState === OPEN) {
    Exec.executeCommandLine(Duration.ofSeconds(30), '/usr/bin/python3', '/etc/openhab/scripts/openhab-log-influxdb.py', '-t knx', '-d system-wide', '-l ' + itemName + ' ausgelöst!')
    // logger.info('logged ' + itemName + ' to the smarthome-log')
  }
}

logAlarm(event.itemName)
