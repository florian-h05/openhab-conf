// @ts-check

const { rules, triggers } = require('openhab');
// @ts-ignore
console.loggerName = "org.openhab.logging.knx";

rules.JSRule({
  name: 'KNX Logging to INFO',
  description: 'Log alarms, shading, etc. to separate log file',
  triggers: [
    triggers.GroupStateChangeTrigger('gAlarme'),
    triggers.GroupStateChangeTrigger('KNX_AutoAus'),
    triggers.GroupStateChangeTrigger('KNX_BeschattungStatus')
  ],
  execute: (event) => {
    console.info(event.itemName + ' changed to ' + event.newState);
  },
  id: 'knx-logging-to-INFO',
  tags: ['Logging', 'KNX']
});

rules.JSRule({
  name: 'KNX Logging to DEBUG',
  description: 'Log weatherdata to separate log file',
  triggers: [
    triggers.GroupStateChangeTrigger('gWetterdaten')
  ],
  execute: (event) => {
    console.debug(event.itemName + ' changed to ' + event.newState);
  },
  id: 'knx-logging-to-DEBUG',
  tags: ['Logging', 'KNX']
});
