# JavaScript Automation Add-On (GraalVM)

The `JavaScript Automation` Add-On provides support for `JavaScript/ECMA 11`.
In contrast to the included openHAB JavaScript engine (`NashornJS`), nothing from openHAB is imported.

***
## Table Of Contents

***
## 1. Service

Import the basic openHAB services, which are included in `NashornJS`, to access items and more.
```javascript
let { itemRegistry, things, rules, events, actions } = require('@runtime');
```
Please note that `toString()` is supported, but `toBigDecimal()`is not working anymore.

***
## 2. Types & Units

Import types & units from openHAB to perform conversions and more.
```javascript
let <typeOrUnit> = Java.type('org.openhab.core.library.types.<typeOrUnit>');
// Example.
let HSBType = Java.type('org.openhab.core.library.types.HSBType');
```

Available types are:
* `QuantityType`
* `StringListType` 
* `RawType`
* `DateTimeType`
* `DecimalType`
* `HSBType`
* `PercentType`
* `PointType`
* `StringType`

Available untis are:
* `SIUnits`
* `ImperialUnits`
* `MetricPrefix`
* `Units`
* `BinaryPrefix`

***
## 3. Logging

```javascript
let logger = Java.type('org.slf4j.LoggerFactory').getLogger('org.openhab.rule.<ruleId>');
logger.info('Successfully logged info.');
logger.debug('Successfully logged debug.');
logger.error('Successfully logged error.');
```
Replace `<ruleId>` with your rule's or script's (unique-)id.

***
## 4. Create timers

Currently, my favourite solution for timers, the [timerMgr](https://github.com/rkoshak/openhab-rules-tools/tree/main/timer_mgr) module, does not support GraalVM.
The "normal" way to create timers works.
```javascript
// Needs the ZonedDateTime imports.
let ZonedDateTime = Java.type('java.time.ZonedDateTime');
let now = ZonedDateTime.now();
let ScriptExecution = Java.type('org.openhab.core.model.script.actions.ScriptExecution');

// Function to run when the timer goes off
function timerOver () {
  logger.info('The timer is over.');
}

// Create the Timer
this.myTimer = ScriptExecution.createTimer(now.plusSeconds(10), timerOver);
```

***
## 4. Call another script/rule

```javascript
let FrameworkUtil = Java.type('org.osgi.framework.FrameworkUtil');
let scriptExtension = Java.type('org.openhab.core.automation.module.script.ScriptExtensionProvider');
let _bundle = FrameworkUtil.getBundle(scriptExtension.class);
let bundleContext = _bundle.getBundleContext();
var RuleManagerRef = bundleContext.getServiceReference('org.openhab.core.automation.RuleManager');
var RuleManager = bundleContext.getService(RuleManagerRef);
// simple call
RuleManager.runNow('<scriptToRun>');
// call with passed data
var map = new java.util.HashMap();
map.put('identifier1', 'value1');
map.put('identifier2', 'value2');
RuleManager.runNow('<scriptToRun>', true, map); // second argument is whether to consider the conditions, third is a Map<String, Object> (a way to pass data)
```
Replace `<scriptToRun>` with your rule's or script's (unique-)id.

***
## 5. Ephemeris

Ephemeris allows time-based actions.
For more information, have a look at the [JavaDoc](https://www.openhab.org/javadoc/latest/org/openhab/core/model/script/actions/ephemeris).
```javascript
let Ephemeris = Java.type('org.openhab.core.model.script.actions.Ephemeris');
let weekend = Ephemeris.isWeekend();
```

***
## 6. Execute Command Line

Execute a command on command-line and get the reponse.
```javascript
let Exec = Java.type('org.openhab.core.model.script.actions.Exec');
let Duration = Java.type('java.time.Duration');
let response = Exec.executeCommandLine(Duration.ofSeconds(20), 'echo','hello');
```

***
## 7. HTTP action

Make HTTP requests.
For more information, have a look at the [JavaDoc](https://www.openhab.org/javadoc/latest/org/openhab/core/model/script/actions/http).
```javascript
let HTTP = Java.type('org.openhab.core.model.script.actions.HTTP');
// Example.
var response = HTTP.sendHttpGetRequest('<url>');
```
Replace `<url>` with the request url.

***
## 8. Notification

Send Notifications to openHAB clients using the openHAB Cloud.
```javascript
let NotificationAction = Java.type('org.openhab.io.openhabcloud.NotificationAction')
NotificationAction.sendNotification('<email>', '<message>''); // to a single myopenHAB user identified by e-mail
NotificationAction.sendBroadcastNotification('<message>'); // to all myopenHAB users
```
Replace `<email>` with the e-mail address of the user.
Replace `<message>` with the notification text.

***
## 9. Persistence

Get data from the persistence extension.
For more information, have a look at the [JavaDoc](https://www.openhab.org/javadoc/latest/org/openhab/core/persistence/extensions/persistenceextensions).
```javascript
let PersistenceExtension = Java.type('org.openhab.core.persistence.extensions.PersistenceExtensions');
// last update
let lastUpdate = PersistenceExtension.lastUpdate(itemRegistry.getItem('<item>'), '<persistence>');
// previous state
// don't skip equal values
let previousState = PersistenceExtension.previousState(itemRegistry.getItem('<item>'), false, '<persistence>').state;
// skip equal values
previousState = PersistenceExtension.previousState(itemRegistry.getItem('<item>'), true, '<persistence>').state;
```
Replace `<persistence>` with the persistence service to use.
Replace `<item>` with the itemname.
