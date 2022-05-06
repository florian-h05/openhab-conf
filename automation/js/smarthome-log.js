/*
Copyright (c) 2021 Florian Hotze under MIT License

Hosted at: https://github.com/florian-h05/openhab-conf
*/

const { rules, actions, triggers, items, time } = require('openhab');

// Log alarms.
rules.JSRule({
  name: 'SmartHome Log: Alarms',
  description: 'Log to the InfluxDB SmartHome Log.',
  triggers: [triggers.GroupStateChangeTrigger('Alarms')],
  execute: event => {
    const item = items.getItem(event.itemName);
    // console.info(itemName + ' actual state is: ' + actualState)
    if (item.state === 'OPEN') {
      actions.Exec.executeCommandLine('/usr/bin/python3', '/etc/openhab/scripts/openhab-log-influxdb.py', '-t knx', '-d system-wide', '-l ' + item.name + ' ausgelöst!');
    }
  },
  id: 'smarthome-log_alarms',
  tags: ['SmartHome Log', 'Alarme']
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
      // console.info('logged ' + roomName + ' automatic off to the smarthome-log')
    } else if (item.state === 'OFF') {
      actions.Exec.executeCommandLine('/usr/bin/python3', '/etc/openhab/scripts/openhab-log-influxdb.py', '-t knx', '-d ' + roomName, '-l Automatik aktiviert.');
      // console.info('logged ' + roomName + ' automatic on to the smarthome-log')
    }
  },
  id: 'smarthome-log_knx-auto-off',
  tags: ['SmartHome Log', 'KNX']
});

// KNX Shading.
rules.JSRule({
  name: 'SmartHome Log: KNX Shading',
  description: 'Log to the InfluxDB SmartHome Log.',
  triggers: [triggers.GroupStateChangeTrigger('KNX_BeschattungStatus')],
  execute: event => {
    const item = items.getItem(event.itemName);
    // console.info(itemName + ' actual state is: ' + actualState)
    const deviceName = item.name.replace('_BeschStat', '');
    if (item.state === 'ON') {
      actions.Exec.executeCommandLine('/usr/bin/python3', '/etc/openhab/scripts/openhab-log-influxdb.py', '-t knx', '-d ' + deviceName, '-l Aut. Verschattung aktiviert.');
      // console.info('logged ' + deviceName + ' shading on to the smarthome-log')
    } else if (item.state === 'OFF') {
      actions.Exec.executeCommandLine('/usr/bin/python3', '/etc/openhab/scripts/openhab-log-influxdb.py', '-t knx', '-d ' + deviceName, '-l Aut. Verschattung deaktiviert.');
      // console.info('logged ' + deviceName + ' shading off to the smarthome-log')
    }
  },
  id: 'smarthome-log_knx-shading',
  tags: ['SmartHome Log', 'Verschattung']
});
