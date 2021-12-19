/*
Copyright (c) 2021 Florian Hotze under MIT License
*/

const { rules, triggers, items } = require('openhab');

// Generates an alarm status string.
rules.JSRule({
  name: 'Alarm Status String Summary',
  description: 'Summarize alarms.',
  triggers: [
    triggers.SystemStartlevelTrigger(100),
    triggers.GenericCronTrigger('0 0/5 * * * *'),
    triggers.ItemStateChangeTrigger('Kontakte'),
    triggers.ItemStateChangeTrigger('Regenalarm'),
    triggers.ItemStateChangeTrigger('Hitze_Stufe'),
    triggers.ItemStateChangeTrigger('Frost_Stufe')
  ],
  execute: data => {
    const contacts = items.getItem('Kontakte').state;
    const rain = items.getItem('Regenalarm').state;
    const heatLevel = parseInt(items.getItem('Hitze_Stufe').state);
    const frostLevel = parseInt(items.getItem('Frost_Stufe').state);

    let statusString = '';
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
    // Post string to openHAB item.
    items.getItem('Alarm_Status').postUpdate(statusString);
  }
});

// Generates a system status overview string.
rules.JSRule({
  name: 'System Status String Summary',
  description: 'Summarize state of things.',
  triggers: [
    triggers.SystemStartlevelTrigger(100),
    triggers.GenericCronTrigger('0 0/5 * * * *'),
    triggers.GroupStateChangeTrigger('KNXState'),
    triggers.GroupStateChangeTrigger('YamahaState')
  ],
  execute: data => {
    let knx = false;
    let yamaha = false;
    let statusString = '';

    // KNX Things
    let members = items.getItem('KNXState').members.map(item => item.name);
    for (let i = 0; i < members.length; i++) {
      const state = items.getItem(members[i]).state;
      if (state !== 'ONLINE') {
        knx = true;
      }
    }

    // Yamaha Things
    members = items.getItem('YamahaState').members.map(item => item.name);
    for (let i = 0; i < members.length; i++) {
      const state = items.getItem(members[i]).state;
      if (state !== 'ONLINE') {
        yamaha = true;
      }
    }

    // Generate status string
    if (knx === true) {
      statusString += 'mind. 1 KNX Gerät nicht erreichbar!';
    } else if (knx === false) {
      statusString += 'KNX okay';
    }
    if (yamaha === true) {
      statusString += '; mind. 1 Verstärker nicht erreichbar!';
    } else if (yamaha === false) {
      statusString += '; Verstärker okay';
    }
    // Post string to openHAB item
    items.getItem('Systemstatus').postUpdate(statusString);
  }
});
