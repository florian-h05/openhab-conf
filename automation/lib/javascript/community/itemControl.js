/**
 * Utilities for working with openHAB items in JavaScript.
 * This code is not compatible with the GraalVM JavaScript add-on.
 *
 * Tested to work with openHAB 3.1.0 stable.
 * Copyright (c) 2021 Florian Hotze under MIT License
 */

/**
 * Constructor, initializes the log.
 */
var ItemControl = function () {
  this.log = Java.type('org.slf4j.LoggerFactory').getLogger('org.openhab.model.script.Rules.ItemUtils')
  this.log.debug('Building itemControl instance.')
  this.dimmers = {}
  this.ZonedDateTime = Java.type('java.time.ZonedDateTime')
  this.now = this.ZonedDateTime.now()
  this.ScriptExecution = Java.type('org.openhab.core.model.script.actions.ScriptExecution')
  this.log.debug('Item Control is ready to operate')
}

/**
 * Dimming a sound volume to a target value with a user-set time for each volume step.
 *
 * @param {*} dummyItem Name of the openHAB item that represents the target value and the state
 * @param {*} realItem Name of the openHAB item that controls the volume
 * @param {*} timePerStep Time for each step in milliseconds
 */
ItemControl.prototype.volumeDimming = function (dummyItem, realItem, timePerStep) {
  // Dimmer scheduler process exists
  if (realItem in this.dimmers) {
    this.log.debug('Dimming process for ' + realItem + ' already running! Skipping.')
    // Dimmer doesn't already exist, create it
  } else {
    this.log.debug('Starting dimming process for ' + realItem)
    // getting all values
    var target = itemRegistry.getItem(dummyItem).getState().toBigDecimal()
    var current = itemRegistry.getItem(realItem).getState().toBigDecimal()
    var diff = target - current // positive value for increasing the volume; negative for decreasing
    var time = Math.abs(diff) * timePerStep // time needed for dimming
    this.log.debug('Real item: ' + realItem + '; dummy item: ' + dummyItem)
    this.log.debug('Real value: ' + current + '; target value: ' + target)
    this.log.debug('Difference is: ' + diff + '; time for dimming: ' + time + ' ms')
    // processing the dimming
    this.dimmers[realItem] = { 'real item': realItem, 'dummy item': dummyItem, 'time per step': timePerStep }
    // dimming all steps except the last step to the target level
    for (var i = 1; i < Math.abs(diff); i++) {
      function timerOver (item, value, updateItem) {
        return function () {
          events.sendCommand(item, value)
          events.postUpdate(updateItem, value)
          this.log = Java.type('org.slf4j.LoggerFactory').getLogger('org.openhab.model.script.Rules.ItemUtils')
          this.log.debug('Dimming to: ' + value + ' dB')
        }
      }
      if (diff > 0) { // increasing
        this.log.debug('Increasing, step: ' + i + '; time: ' + i * timePerStep / 1000 + ' sec; value: ' + (current + i))
        this.ScriptExecution.createTimer(this.now.plusSeconds((i * timePerStep) / 1000), timerOver(realItem, current + i, dummyItem))
      } else if (diff < 0) { // decreasing
        this.log.debug('Decreasing, step: ' + i + '; time: ' + i * timePerStep / 1000 + ' sec; value: ' + (current - i))
        this.ScriptExecution.createTimer(this.now.plusSeconds((i * timePerStep) / 1000), timerOver(realItem, current - i, dummyItem))
      }
    }
    // dimming the last step
    // needed because sometimes the target is not reached
    function timerOverTarget (item, value, updateItem) {
      return function () {
        events.sendCommand(item, value)
        events.postUpdate(updateItem, value)
        this.log = Java.type('org.slf4j.LoggerFactory').getLogger('org.openhab.model.script.Rules.ItemUtils')
        this.log.debug('Final dimming to: ' + value + ' dB')
      }
    }
    if (diff > 0) { // increasing
      this.log.debug('Final increasing, step: ' + i + '; time: ' + i * timePerStep / 1000 + ' sec; value: ' + target)
      this.ScriptExecution.createTimer(this.now.plusSeconds(i * timePerStep / 1000 + 0.15), timerOverTarget(realItem, target, dummyItem))
    } else if (diff < 0) { // decreasing
      this.log.debug('Final decreasing, step: ' + i + '; time: ' + i * timePerStep / 1000 + ' sec; value: ' + target)
      this.ScriptExecution.createTimer(this.now.plusSeconds(i * timePerStep / 1000 + 0.15), timerOverTarget(realItem, target, dummyItem))
    }
    delete this.dimmers[realItem]
  }
}
