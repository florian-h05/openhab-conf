/*
This script generates a system status overview string.

Copyright (c) 2021 Florian Hotze under MIT License
*/

const { rules, triggers, items } = require('openhab');

rules.JSRule({
  name: 'System Status String Summary',
  description: 'Summarize state of things.',
  triggers: [
    triggers.SystemStartlevelTrigger(100),
    triggers.GroupStateChangeTrigger('KNXState'),
    triggers.GroupStateChangeTrigger('YamahaState')
  ],
  execute: data => {
    let knx = false, yamaha = false;
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
