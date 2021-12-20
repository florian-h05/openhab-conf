const { rules, actions, triggers, items } = require('openhab');
const logger = require('openhab').log('System-JS');

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

// For shaddow.py
rules.when().channel('astro:sun:home:set#event').triggered('START').then().copyAndSendState().fromItem('Sun_Azimuth').toItem('Sunset_Azimuth').build('Astro: Sonnenuntergang speichern', '... in Item Sunset_Azimuth.');
rules.when().channel('astro:sun:home:rise#event').triggered('START').then().copyAndSendState().fromItem('Sun_Azimuth').toItem('Sunrise_Azimuth').build('Astro: Sonnenaufgang speichern', '... in Item Sunrise_Azimuth.');
rules.when().item('Sun_Azimuth').changed().then(e => {
  actions.Exec.executeCommandLine('/usr/bin/python3', '/etc/openhab/scripts/3shaddow.py', 'update');
}).build('shaddow.py: Update', '... bei Änderung von Azimut.');

logger.info('Script loaded.');
