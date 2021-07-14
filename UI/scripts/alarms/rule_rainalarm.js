/*
This script calls the rainalarm script with the needed parameters.
This script has to be in the rule.
The main script's function could also be build here, but I wanted to seperate for better code reuse.
Copyright (c) 2021 Florian Hotze under MIT License
*/

var FrameworkUtil = Java.type('org.osgi.framework.FrameworkUtil')
var _bundle = FrameworkUtil.getBundle(scriptExtension.class)
var bundleContext = _bundle.getBundleContext()
var classname = 'org.openhab.core.automation.RuleManager'
var RuleManagerRef = bundleContext.getServiceReference(classname)
var RuleManager = bundleContext.getService(RuleManagerRef)
// call with passed data
var map = new java.util.HashMap()

if (typeof event !== 'undefined') {
  if (event.itemName === 'Regenalarm') {
    map.put('mode', 'onAlarm')
  } else {
    map.put('mode', 'onChange')
    map.put('triggeringItem', event.itemName)
  }
}

RuleManager.runNow('rainalarm-script', true, map) // second argument is whether to consider the conditions, third is a Map<String, Object> (a way to pass data)
