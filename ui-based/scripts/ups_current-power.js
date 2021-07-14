/*
This script calculates the current output power of the ups by using the maximal power and the current load.
Configuration of itemnames in lines 11 + 16.
The "Unique ID" should be: "ups_current-power-script".
Copyright (c) 2021 Florian Hotze under MIT License
*/

var logger = Java.type('org.slf4j.LoggerFactory').getLogger('org.openhab.rule.' + ctx.ruleUID)

var maxPower = 420 // in watts, here: Eaton 3S 700
var currentLoad = itemRegistry.getItem('ups_upsLoadCurrent').getState()
// the percent to get
var currentLoadAsDecimal = (currentLoad / 100)
// the current power
var currentPower = currentLoadAsDecimal * maxPower
events.postUpdate('ups_calculatedPower', currentPower)
// logger.info('Current Power is: ' + currentPower + 'W. Calculated with ' + currentLoad + ' of 420W.')
