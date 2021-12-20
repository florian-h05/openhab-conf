/*
Copyright (c) 2021 Florian Hotze under MIT License
*/

const { rules, actions, triggers, items } = require('openhab');
const logger = require('openhab').log('smarthome-log-JS');

// Log alarms.
rules.JSRule({
  name: 'SmartHome Log: Alarms',
  description: 'Log to the InfluxDB SmartHome Log.',
  triggers: [triggers.GroupStateChangeTrigger('Alarms')],
  execute: event => {
    const item = items.getItem(event.itemName);
    // logger.info(itemName + ' actual state is: ' + actualState)
    if (item.state === 'OPEN') {
      actions.Exec.executeCommandLine('/usr/bin/python3', '/etc/openhab/scripts/openhab-log-influxdb.py', '-t knx', '-d system-wide', '-l ' + item.name + ' ausgelöst!');
    }
  },
  id: 'smarthome-log_alarms'
});

// KNX disable automatics.
rules.JSRule({
  name: 'SmartHome Log: KNX Auto-Off',
  description: 'Log to the InfluxDB SmartHome Log.',
  triggers: [triggers.GroupStateChangeTrigger('KNX_AutoAus')],
  execute: event => {
    const item = items.getItem(event.itemName);
    const roomName = item.name.split('_')[0];
    // check the state and log
    if (item.state === 'ON') {
      actions.Exec.executeCommandLine('/usr/bin/python3', '/etc/openhab/scripts/openhab-log-influxdb.py', '-t knx', '-d ' + roomName, '-l Automatik deaktiviert.');
      // logger.info('logged ' + roomName + ' automatic off to the smarthome-log')
    } else if (item.state === 'OFF') {
      actions.Exec.executeCommandLine('/usr/bin/python3', '/etc/openhab/scripts/openhab-log-influxdb.py', '-t knx', '-d ' + roomName, '-l Automatik aktiviert.');
      // logger.info('logged ' + roomName + ' automatic on to the smarthome-log')
    }
  },
  id: 'smarthome-log_knx-auto-off'
});

// KNX Shading.
rules.JSRule({
  name: 'SmartHome Log: KNX Shading',
  description: 'Log to the InfluxDB SmartHome Log.',
  triggers: [triggers.GroupStateChangeTrigger('KNX_BeschattungStatus')],
  execute: event => {
    const item = items.getItem(event.itemName);
    // logger.info(itemName + ' actual state is: ' + actualState)
    const deviceName = item.name.replace('_BeschStat', '');
    if (item.state === 'ON') {
      actions.Exec.executeCommandLine('/usr/bin/python3', '/etc/openhab/scripts/openhab-log-influxdb.py', '-t knx', '-d ' + deviceName, '-l Aut. Verschattung aktiviert.');
      // logger.info('logged ' + deviceName + ' shading on to the smarthome-log')
    } else if (item.state === 'OFF') {
      actions.Exec.executeCommandLine('/usr/bin/python3', '/etc/openhab/scripts/openhab-log-influxdb.py', '-t knx', '-d ' + deviceName, '-l Aut. Verschattung deaktiviert.');
      // logger.info('logged ' + deviceName + ' shading off to the smarthome-log')
    }
  },
  id: 'smarthome-log_knx-shading'
});

logger.info('Script loaded.');
