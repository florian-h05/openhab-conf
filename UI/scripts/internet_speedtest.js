/*
This script measures the current internet perfomance with Ookla.
It requires:
  - Speedtest from Ookla, available at: https://www.speedtest.net/de/apps/cli
  - speedtest.items from this repo.
The "Unique ID" of this script should be: "speedtest-script".

Copyright (c) 2021 Florian Hotze under MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

var logger = Java.type('org.slf4j.LoggerFactory').getLogger('org.openhab.rule.' + ctx.ruleUID)
var Exec = Java.type('org.openhab.core.model.script.actions.Exec')
var Duration = Java.type('java.time.Duration')

logger.info('Starting speedtest.')
events.postUpdate('SpeedtestRunning', 'Messung läuft ...')
var output = Exec.executeCommandLine(Duration.ofSeconds(40), '/bin/speedtest', '--accept-license', '--accept-gdpr') // Run speedtest
var results = output.split(/\r?\n/) // Split output by newline
var ping, down , up // Declare result vars
var check1 = output.search('Speedtest') // Simple error check

if (check1 !== -1) {
  events.postUpdate('SpeedtestResultDate', new DateTimeType()) // Update result timestamp
  events.postUpdate('SpeedtestRunning', 'Datenauswertung ...')
  // check for the given keywords
  for (var index in results) {
    var text = results[index]
    var b = text.search('Latency:') // Get latency/ping
    if (b !== -1) {
      ping = parseFloat(text.split(/:| ms/)[1])
    }
    b = text.search('Download:') // Get download
    if (b !== -1) {
      down = parseFloat(text.split(/:| Mbps/)[1])
    }
    b = text.search('Upload') // Get upload
    if (b !== -1) {
      up = parseFloat(text.split(/:| Mbps/)[1])
    }
  }
  // post numbers to openHAB items
  events.postUpdate('SpeedtestResultPing', ping)
  events.postUpdate('SpeedtestResultDown', down)
  events.postUpdate('SpeedtestResultUp', up)
  var summary = 'ᐁ ' + down.toFixed(1) + ' Mbit/s  ᐃ ' + up.toFixed(1) + ' Mbit/s (' + ping.toFixed(0) + ' ms)' // template literals are not supported in ECMAScript 5
  events.postUpdate('SpeedtestSummary', summary)
  events.postUpdate('SpeedtestRunning', '-')
  logger.info('Speedtest finished.')
} else {
  logger.error('Speedtest failed.')
  events.postUpdate('SpeedtestRunning', 'Letzte Ausführung fehlgeschlagen.')
}
