// import logging
let logger = Java.type('org.slf4j.LoggerFactory').getLogger('org.openhab.rule.test')
logger.info('Successfully tested logging.')

/* ------------------------------------------------------------------------------------------------------------------------------------------ */
// import pre-included services
let { itemRegistry, things, rules, events, actions } = require('@runtime')
/* ------------------------------------------------------------------------------------------------------------------------------------------ */
// how to work with item states:

// for items types except number based types/use:
let state = itemRegistry.getItem('test_switch').getState().toString()
// in if statements
if ( state === 'ON' ) {
  // do stuff
}
// sendCommand / postUpdate -- example commands: ON, OFF, UP, DOWN
events.sendCommand('test_switch', 'ON')

// for items with numbers and comparisons, like dimmer, number, rollershutter:
let stateNum = itemRegistry.getItem('test_dimmer').getState()
// in if statements
if ( stateNum > 20 ) {
  // do stuff
}
// sendCommand / postUpdate
// you can only use number values, commands: INCREASE and DECRASE do not work, use absolute numbers or ON, OFF
events.sendCommand('test_dimmer', 'ON')
events.sendCommand('test_dimmer', '24')
/* ------------------------------------------------------------------------------------------------------------------------------------------ */

// until here everything is tested to work

// this has to be worked on:
/* ------------------------------------------------------------------------------------------------------------------------------------------ */
// import pre-included types & type conversions
// type conversions like HSBType.fromRGB(r, g, b) do not work with this implementation
let { QuantityType, StringListType, RawType, DateTimeType, DecimalType, HSBType, PercentType, PointType, StringType } = require('@runtime')
let { SIUnits, ImperialUnits, MetricPrefix, Units, BinaryPrefix } = require('@runtime')
/* ------------------------------------------------------------------------------------------------------------------------------------------ */
// import openHAB Java classes throws errors!!
//var NotificationAction = Java.type('org.openhab.io.openhabcloud.NotificationAction')
//let Exec = Java.type('org.openhab.core.model.script.actions.Exec')
