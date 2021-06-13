/*
This script logs alarms to the InfluxDB smarthome log.
Configure it in line 27.
*/

var itemName

var logger = Java.type('org.slf4j.LoggerFactory').getLogger('org.openhab.rule.' + ctx.ruleUID);
var PersistenceExtension = Java.type("org.openhab.core.persistence.extensions.PersistenceExtensions");
var ZonedDateTime = Java.type("java.time.ZonedDateTime");
var now = ZonedDateTime.now();
var Exec = Java.type("org.openhab.core.model.script.actions.Exec");
var Duration = Java.type("java.time.Duration");

function logAlarm(itemName) {
  var previousState = PersistenceExtension.previousState(ir.getItem(itemName), false, "rrd4j").state;
  var actualState = itemRegistry.getItem(itemName).getState();
  //logger.info(itemName + ' previous state is: ' + previousState);
  //logger.info(itemName + ' actual state is: ' + actualState);
  if ((previousState == CLOSED) && (actualState == OPEN)) {
    Exec.executeCommandLine(Duration.ofSeconds(30), "/usr/bin/python3","/etc/openhab/scripts/openhab-log-influxdb.py","-t knx","-d system-wide","-l " + itemName + " ausgelöst!");
    //logger.info('logged ' + itemName + ' to the smarthome-log');
  }
}

// insert your alarm item's names into the list
var alarm_list = ['alarm1', 'alarm2', 'alarm3'];
for (var index in alarm_list) {
  logAlarm(alarm_list[index]);
}
