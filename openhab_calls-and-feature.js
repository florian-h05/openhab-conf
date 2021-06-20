/*
This file collects a part of openHAB specific calls and features.
*/

/* -------------------------------------------------------------------------------------------------------------------------------------------- */
/* logging */
var logger = Java.type('org.slf4j.LoggerFactory').getLogger('org.openhab.rule.' + ctx.ruleUID)
logger.info((['message: ', variable].join('')))
logger.error((['error message: ', variable].join('')))

/* -------------------------------------------------------------------------------------------------------------------------------------------- */
/* createTimer */
// needs the ZonedDateTime imports
var ZonedDateTime = Java.type('java.time.ZonedDateTime')
var now = ZonedDateTime.now()
var ScriptExecution = Java.type('org.openhab.core.model.script.actions.ScriptExecution')

// Function to run when the timer goes off
function timerOver () {
  logger.info('The timer is over.')
}

// Create the Timer
this.myTimer = ScriptExecution.createTimer(now.plusSeconds(10), timerOver);

/* -------------------------------------------------------------------------------------------------------------------------------------------- */
/* Call another rule */
var FrameworkUtil = Java.type('org.osgi.framework.FrameworkUtil')
var _bundle = FrameworkUtil.getBundle(scriptExtension.class)
var bundleContext = _bundle.getBundleContext()
var classname = 'org.openhab.core.automation.RuleManager'
var RuleManagerRef = bundleContext.getServiceReference(classname)
var RuleManager = bundleContext.getService(RuleManagerRef)
// simple call
RuleManager.runNow('scriptToRun')
// call with passed data
var map = new java.util.HashMap()
map.put('identifier1', 'value1')
map.put('identifier2', 'value2')
RuleManager.runNow('scriptToRun', true, map) // second argument is whether to consider the conditions, third is a Map<String, Object> (a way to pass data)

/* -------------------------------------------------------------------------------------------------------------------------------------------- */
/* Ephemeris (time-based actions) (javadoc: https://www.openhab.org/javadoc/latest/org/openhab/core/model/script/actions/ephemeris) */
var Ephemeris = Java.type('org.openhab.core.model.script.actions.Ephemeris')
var weekend = Ephemeris.isWeekend()

/* -------------------------------------------------------------------------------------------------------------------------------------------- */
/* executeCommandLine */
var Exec = Java.type('org.openhab.core.model.script.actions.Exec')
var Duration = Java.type('java.time.Duration')
var results = Exec.executeCommandLine(Duration.ofSeconds(20), 'echo','hello')

/* -------------------------------------------------------------------------------------------------------------------------------------------- */
/* get group members */

var groupMembers // is an array
// Get the members of a group. Call it with the group item's name.
function getGroupMembers (groupName) {
  var membersString = new String(ir.getItem(groupName).members)
  var membersSplit = membersString.split(' (')
  var firstMember = membersSplit[0].split('[')
  groupMembers = [firstMember[1]]
  // remove the first element
  membersSplit.splice(0, 1)
  // remove the last element
  membersSplit.splice(-1, 1)
  // iterate over the rest of membersSplit and add to groupMembers
  for (var index in membersSplit) {
    var nMember = membersSplit[index].split('), ')
    groupMembers.push(nMember[1])
  }
}

/* -------------------------------------------------------------------------------------------------------------------------------------------- */
/* get item state */
var actualState = itemRegistry.getItem('itemName').getState()

/* -------------------------------------------------------------------------------------------------------------------------------------------- */
/* myopenHAB Notification */
var NotificationAction = Java.type('org.openhab.io.openhabcloud.NotificationAction')
NotificationAction.sendNotification('email', 'message') // to a single myopenHAB user identified by e-mail
NotificationAction.sendBroadcastNotification('message') // to all myopenHAB users

/* -------------------------------------------------------------------------------------------------------------------------------------------- */
/* persistence (javadoc: https://www.openhab.org/javadoc/latest/org/openhab/core/persistence/extensions/persistenceextensions) */
var PersistenceExtension = Java.type('org.openhab.core.persistence.extensions.PersistenceExtensions')
// "persistenceservice" examples: "rrd4j"
// last update
var lastUpdate = PersistenceExtension.lastUpdate(ir.getItem('itemName'), 'persistenceservice')
// previous state
// don't skip equal values
var previousState = PersistenceExtension.previousState(ir.getItem('itemName'), false, 'persistenceservice').state
// skip equal values
var previousState = PersistenceExtension.previousState(ir.getItem('itemName'), true, 'persistenceservice').state

/* -------------------------------------------------------------------------------------------------------------------------------------------- */
/* ZonedDateTime (javadoc: https://docs.oracle.com/en/java/javase/11/docs/api/java.base/java/time/ZonedDateTime.html?is-external=true) */
var ZonedDateTime = Java.type('java.time.ZonedDateTime')
var now = ZonedDateTime.now()
