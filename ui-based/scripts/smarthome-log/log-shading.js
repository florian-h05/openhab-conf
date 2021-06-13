/*
This script logs knx shading to the InfluxDB smarthome log.
Configure it in line 29.
*/

var deviceName, itemName

var logger = Java.type('org.slf4j.LoggerFactory').getLogger('org.openhab.rule.' + ctx.ruleUID);
var PersistenceExtension = Java.type("org.openhab.core.persistence.extensions.PersistenceExtensions");
var ZonedDateTime = Java.type("java.time.ZonedDateTime");
var now = ZonedDateTime.now();
var Exec = Java.type("org.openhab.core.model.script.actions.Exec");
var Duration = Java.type("java.time.Duration");

function logShading(deviceName) {
  itemName = deviceName;
  itemName += '_BeschStat';
  var previousState = PersistenceExtension.previousState(ir.getItem(itemName), false).state;
  var actualState = itemRegistry.getItem(itemName).getState();
  //logger.info(itemName + ' previous state is: ' + previousState);
  //logger.info(itemName + ' actual state is: ' + actualState);
  if ((previousState == OFF) && (actualState == ON)) {
    Exec.executeCommandLine(Duration.ofSeconds(30), "/usr/bin/python3","/etc/openhab/scripts/openhab-log-influxdb.py","-t knx","-d " + deviceName,"-l Aut. Verschattung aktiviert.");
    //logger.info('logged ' + deviceName + ' shading on to the smarthome-log');
  }
  if ((previousState == ON) && (actualState == OFF)) {
    Exec.executeCommandLine(Duration.ofSeconds(30), "/usr/bin/python3","/etc/openhab/scripts/openhab-log-influxdb.py","-t knx","-d " + deviceName,"-l Aut. Verschattung deaktiviert.");
    //logger.info('logged ' + deviceName + ' shading off to the smarthome-log');
  }
}

// insert your shading item's names into the list
var shading_list = ['shading1', 'shading2', 'shading3'];
for (var index in shading_list) {
  logShading(shading_list[index]);
}
