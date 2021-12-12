/**
 * Scene engine. 
 * Call scenes using a selectorItem and update the selectorItem to the matching scene on scene members' change.
 * This code is not compatible with the GraalVM JavaScript add-on.
 *
 * NOTE: getTriggers is not working for now.
 *
 * Copyright (c) 2021 Florian Hotze under MIT License
 */

/**
 * Constructor, initializes the logger.
 */
var SceneEngine = function () {
  this.log = Java.type('org.slf4j.LoggerFactory').getLogger('org.openhab.model.script.Rules.SceneEngine')
  this.log.debug('Building SceneEngine instance.')
  this.log.debug('SceneEngine is ready to operate')
}

/**
 * Calls a scene based on the sceneSelector's numeric state.
 *
 * @param {string} selectorItem openHAB Item used for scene selection
 * @param {*} scenesDefinition Array of Objects that defines the scenes
 */
SceneEngine.prototype.callScene = function (selectorItem, scenesDefinition) {
  // Get the correct sceneSelector.
  for (var i = 0; i < scenesDefinition.length; i++) {
    var currentSelector = scenesDefinition[i];
    this.log.info('Checking sceneSelector [{}].', currentSelector.selectorItem);
    if (currentSelector.selectorItem === selectorItem) {
      this.log.info('Found sceneSelector [{}].', currentSelector.selectorItem);
      // Get the correct selectorState.
      for (var j = 0; j < currentSelector.selectorStates.length; j++) {
        // Get the correct sceneTargets.
        var currentState = currentSelector.selectorStates[j];
        this.log.info('Checking sceneTarget [{}] for match with selectorItem\'s state.', currentState.selectorValue);
        if (currentState.selectorValue == itemRegistry.getItem(selectorItem).getState().toBigDecimal()) {
          this.log.info('Found scene Target [{}].', currentState.selectorValue);
          var currentTargets = currentState.sceneTargets;
          // Send commands to items.
          for (var k = 0; k < currentTargets.length; k++) {
            events.sendCommand(currentTargets[k].item, currentTargets[k].value);
          }
        }
      }
    }
  }
}

/**
 * When a scene member changes, check whether a scene and which scene matches all required targets.
 * The matching selectorValue is posted to the sceneSelector.
 *
 * @param {string} triggeringItem openHAB Item that is member of scene and has changed
 * @param {*} scenesDefinition Array of Objects that defines the scenes
 */
SceneEngine.prototype.checkScene = function (triggeringItem, scenesDefinition) {
  // Check each sceneSelector.
  for (var i = 0; i < scenesDefinition.length; i++) {
    var selectorValueMatching = 0;
    var currentSelector = scenesDefinition[i]; 
    this.log.info('Checking sceneSelector [{}].', currentSelector.selectorItem);
    // Check each selectorState.
    for (var j = 0; j < currentSelector.selectorStates.length; j++) {
      // Check for each sceneTarget.
      var currentState = currentSelector.selectorStates[j];
      for (var k = 0; k < currentState.sceneTargets.length; k++) {
        // Find the triggeringItem.
        if (currentState.sceneTargets[k].item === triggeringItem) {
          this.log.info('Found triggeringItem [{}] in selectorValue [{}].', triggeringItem, currentState.selectorValue);
          // Check whether all required items in the selectorValue's sceneTargets match.
          var statesMatchingValue = true;
          for (var l = 0; l < currentState.sceneTargets.length; l++) {
            var targetItem = currentState.sceneTargets[l];
            if (targetItem.required == true) {
              var itemState = itemRegistry.getItem(targetItem.item).getState().toString();
              if (!(itemState === targetItem.value.toString()) ||
                 (itemState === '0' && targetItem.value.toString().toUpperCase() === 'OFF') ||
                 (itemState === '100' && targetItem.value.toString().toUpperCase() === 'ON') ||
                 (itemState === '0' && targetItem.value.toString().toUpperCase() === 'UP') ||
                 (itemState === '100' && targetItem.value.toString().toUpperCase() === 'DOWN')) {
                statesMatchingValue = false;
              }
            }
          }
          if (statesMatchingValue == true) {
            this.log.info('Found matching selectorValue [{}].', currentState.selectorValue);
            // Store the current selectorValue, that is matching all required targets.
            selectorValueMatching = currentState.selectorValue;
          }
        }
      }
    }
    // Update sceneSelector with the selectorValue matching all sceneTargets.
    events.postUpdate(currentSelector.selectorItem, selectorValueMatching);
  }
}

/**
 * Get all required triggers for the scene rule.
 *
 * @param {*} scenesDefinition Array of Objects that defines the scenes
 * @returns {*} triggers Triggers for the openHAB Rule Engine
 */
SceneEngine.prototype.getTriggers = function (scenesDefinition) {
  var triggers = [];
  var updateItems = [];
  // For each sceneSelector the selectorItem.
  for (var i = 0; i < scenesDefinition.length; i++) {
    var currentSelector = scenesDefinition[i]; 
    this.log.info('Adding ItemCommandTrigger [{}].', currentSelector.selectorItem);
    
    // GraalJS [openhab-js]: triggers.push(ItemCommandTrigger(currentSelector.selectorItem));
    triggers.push(currentSelector.selectorItem);
    
    // For each selectorState.
    for (var j = 0; j < currentSelector.selectorStates.length; j++) {
      var currentState = currentSelector.selectorStates[j];
      // For for each sceneTarget, the member items.
      for (var k = 0; k < currentState.sceneTargets.length; k++) {
        var targetItem = currentState.sceneTargets[k].item;
        if (updateItems.indexOf(targetItem) === -1) {
          updateItems.push(targetItem);
        }
      }
    }
  }
  // Put the member items of each scene target into triggers.
  for (var i = 0; i < updateItems.length; i++) {
    this.log.info('Adding ItemStateChangeTrigger [{}].', updateItems[i]);
    
    // GraalJS [openhab-js]: trigger.push(ItemStateChangeTrigger(updateItems[i]));
    triggers.push(updateItems[i]);
    
  }
  return triggers;
}
