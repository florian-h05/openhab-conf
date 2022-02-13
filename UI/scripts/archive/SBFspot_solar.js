/*
This script gets solar inverter data from SBFspot.
It requires:
  - SBFSpot
  - the items from the items/solar.items file on the same GitHub repo
The "Unique ID" of this script should be: "SBFspot_solar-script"
Copyright (c) 2021 Florian Hotze under MIT License
*/

var logger = Java.type('org.slf4j.LoggerFactory').getLogger('org.openhab.rule.' + ctx.ruleUID)
var Exec = Java.type('org.openhab.core.model.script.actions.Exec')
var Duration = Java.type('java.time.Duration')

var output = Exec.executeCommandLine(Duration.ofSeconds(30), '/usr/local/bin/sbfspot.3/SBFspot', '-v', '-finq', '-nocsv', '-nosql')
var results = output.split(/\r?\n/)

var EToday, ETotal, powerOut
var string1Power, string1Voltage, string1Amperage
var string2Power, string2Voltage, string2Amperage

var check1 = output.search('Done.') // simple error check
var check2 = output.search('SBFspot') // another simple error check

if ((check1 !== -1) && (check2 !== -1)) {
  // check for the given keywords
  for (var index in results) {
    var text = results[index]
    var b = text.search('EToday')
    if (b !== -1) {
      EToday = parseFloat(text.split(/:|kWh/)[1])
    }
    b = text.search('ETotal')
    if (b !== -1) {
      ETotal = parseFloat(text.split(/:|kWh/)[1])
    }
    b = text.search('Total Pac')
    if (b !== -1) {
      powerOut = parseFloat(text.split(/:|kW/)[1])
    }
    b = text.search('String 1 Pdc')
    if (b !== -1) {
      var str = text.split(/:|kW|V|A/)
      string1Power = parseFloat(str[1])
      string1Voltage = parseFloat(str[3])
      string1Amperage = parseFloat(str[5])
    }
    b = text.search('String 2 Pdc')
    if (b !== -1) {
      var str = text.split(/:|kW|V|A/)
      string2Power = parseFloat(str[1])
      string2Voltage = parseFloat(str[3])
      string2Amperage = parseFloat(str[5])
    }
  }
  // post numbers to openHAB items
  events.postUpdate('pv_EToday', EToday)
  events.postUpdate('pv_ETotal', ETotal)
  events.postUpdate('pv_Power', powerOut)
  events.postUpdate('pv_string1_power', string1Power)
  events.postUpdate('pv_string1_voltage', string1Voltage)
  events.postUpdate('pv_string1_amperage', string1Amperage)
  events.postUpdate('pv_string2_power', string2Power)
  events.postUpdate('pv_string2_voltage', string2Voltage)
  events.postUpdate('pv_string2_amperage', string2Amperage)
  events.postUpdate('pv_lastRefresh', new DateTimeType())
  logger.info('Data pull from SBFspot completed.')
} else {
  // post numbers to openHAB items
  events.postUpdate('pv_EToday', 0)
  events.postUpdate('pv_Power', 0)
  events.postUpdate('pv_string1_power', 0)
  events.postUpdate('pv_string1_voltage', 0)
  events.postUpdate('pv_string1_amperage', 0)
  events.postUpdate('pv_string2_power', 0)
  events.postUpdate('pv_string2_voltage', 0)
  events.postUpdate('pv_string2_amperage', 0)
  logger.error('Data pull from SBFspot failed. Output:\n ' + output)
}

/*
logger.info('EToday: ' + EToday)
logger.info('ETotal: ' + ETotal)
logger.info('Power out: ' + powerOut)
logger.info('String 1: ' + string1Power + ' kW ' + string1Voltage + ' V ' + string1Amperage + ' A')
logger.info('String 2: ' + string2Power + ' kW ' + string2Voltage + ' V ' + string2Amperage + ' A')
*/
