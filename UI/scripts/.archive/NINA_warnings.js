/*
This script gets warnings and alarms from NINA_Warn.bash.
NINA is the German application to warn of storms, catastrophes and so on.
It requires:
  - NINA script: /etc/openhab/scripts/NINA_Warn.bash
  - NINA_WetterWarn<n> items, n is between 1 and 4.
The "Unique ID" of this script should be: "NINA_warnings".
Copyright (c) 2021 Florian Hotze under MIT License
*/

var logger = Java.type('org.slf4j.LoggerFactory').getLogger('org.openhab.rule.' + ctx.ruleUID)
var Exec = Java.type('org.openhab.core.model.script.actions.Exec')
var Duration = Java.type('java.time.Duration')
var previous // text of previous warning, used to avoid posting the same warning multiple times to openHAB
// NINA sometimes publishes two warnings with same title

var weather = Exec.executeCommandLine(Duration.ofSeconds(10), 'bash', '/etc/openhab/scripts/NINA_Warn.bash', '-w')
//logger.info('Response from NINA_Warn.bash: ' + weather)
weather = weather.split(/\r?\n/)

// post warnings to the items
for (var i = 0; (i < weather.length) && (i < 4); i++) {
  var text = weather[i]
  var n = i+1
  var b = text.search('WARNUNG')
  if (b != -1) {
    text = text.replace('Amtliche ', '')
    if (text != previous) {
      events.postUpdate('NINA_WetterWarn' + n, text)
    } else {
      events.postUpdate('NINA_WetterWarn' + n, 'None.')
    }
    previous = text
  } else {
    events.postUpdate('NINA_WetterWarn' + n, 'None.')
  }
}
