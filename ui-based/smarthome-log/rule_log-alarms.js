/*
This script calls the script that logs alarms to the InfluxDB smarthome log.
This script has to be in the rule.
The main script's function could also be build here, but I wanted to seperate the main script from the rule for better code reuse.
*/

var FrameworkUtil = Java.type('org.osgi.framework.FrameworkUtil')
var _bundle = FrameworkUtil.getBundle(scriptExtension.class)
var bundleContext = _bundle.getBundleContext()
var classname = 'org.openhab.core.automation.RuleManager'
var RuleManagerRef = bundleContext.getServiceReference(classname)
var RuleManager = bundleContext.getService(RuleManagerRef)
// call with passed date
var map = new java.util.HashMap()
map.put('triggeringItem', event.itemName)
RuleManager.runNow('log-alarms-script', true, map) // second argument is whether to consider the conditions, third is a Map<String, Object> (a way to pass data)
