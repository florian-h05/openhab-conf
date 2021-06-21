/*
This script logs knx shading to the InfluxDB smarthome log.
No configuration needed. This script gets "this.triggerinItem" fom the rule that calls the script.
The "Unique ID" of this script should be: "log-shading-script".
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

logShading(this.triggeringItem)
