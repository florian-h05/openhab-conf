/*
This script generates a alarm status overview string.
Configuration of itemnames in lines 11-14 + 34.
The "Unique ID" of this script should be: "alarm-status-string-script".

Copyright (c) 2021 Florian Hotze under MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

/*
Configuration
*/
var contacts = itemRegistry.getItem('Kontakte').getState().toString();
var rain = itemRegistry.getItem('Regenalarm').getState().toString();
var heatLevel = itemRegistry.getItem('Hitze_Stufe').getState();
var frostLevel = itemRegistry.getItem('Frost_Stufe').getState();

/*
Script starts here. Do not modify.
*/
var logger = Java.type('org.slf4j.LoggerFactory').getLogger('org.openhab.rule.' + ctx.ruleUID);

var statusString = '';
if (contacts === 'OPEN') {
  if (rain === 'OPEN') {
    statusString = statusString + 'Regen! ';
  }
  if (heatLevel === 4) {
    statusString = statusString + 'Hitze! ';
  } else if (heatLevel >= 1) {
    statusString = statusString + 'Wärme beachten. ';
  }
  if (frostLevel === 4) {
    statusString = statusString + 'Frost! ';
  } else if (frostLevel >= 1) {
    statusString = statusString + 'Kälte beachten. ';
  }
} else if (contacts === 'OPEN') {
  statusString = '';
}

events.postUpdate('Alarm_Status', statusString);
