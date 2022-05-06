/*
Copyright (c) 2021 Florian Hotze under MIT License

Hosted at: https://github.com/florian-h05/openhab-conf
*/

const { rules, actions, triggers, items } = require('openhab');

// Generates a system status overview string.
rules.JSRule({
  name: 'System Status String Summary',
  description: 'Summarize state of things.',
  triggers: [
    triggers.ItemCommandTrigger('ThingState_Refresh', 'ON'),
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
  },
  id: 'system-status-string',
  tags: ['System', 'Status']
});

// For shaddow.py
rules.when().channel('astro:sun:home:set#event').triggered('START').then().copyAndSendState().fromItem('Sun_Azimuth').toItem('Sunset_Azimuth').build('Astro: Sonnenuntergang speichern', '... in Item Sunset_Azimuth.', ['shaddow.py']);
rules.when().channel('astro:sun:home:rise#event').triggered('START').then().copyAndSendState().fromItem('Sun_Azimuth').toItem('Sunrise_Azimuth').build('Astro: Sonnenaufgang speichern', '... in Item Sunrise_Azimuth.', ['shaddow.py']);
rules.when().item('Sun_Azimuth').changed().then(e => {
  actions.Exec.executeCommandLine('/usr/bin/python3', '/etc/openhab/scripts/3shaddow.py', 'update');
}).build('shaddow.py: Update', '... bei Änderung von Azimut.', ['shaddow.py']);

// Calculates the current output power of UPS.
rules.JSRule({
  name: 'UPS current output power',
  description: 'Calculation based on load and maximum output power.',
  triggers: [
    triggers.ItemStateUpdateTrigger('ups_upsLoadCurrent')
  ],
  execute: data => {
    const maxPower = 420; // For Eaton 3S 700
    const currentLoad = parseFloat(items.getItem('ups_upsLoadCurrent').state) / 100;
    items.getItem('ups_calculatedPower').postUpdate(currentLoad * maxPower);
  },
  id: 'UPS-current-output-power',
  tags: ['System', 'Energie', 'USV']
});
// Sets the state of the UPS status unnormal (e.g. on battery or failure) switch.
rules.JSRule({
  name: 'UPS status unnormal boolean',
  description: 'UPS on battery or failure.',
  triggers: [
    triggers.ItemStateUpdateTrigger('ups_upsStatus')
  ],
  execute: (event) => {
    // For state strings, see: https://github.com/openhab/openhab-addons/blob/main/bundles/org.openhab.binding.networkupstools/src/main/resources/OH-INF/thing/channels.xml#L36
    const stateItem = items.getItem('ups_upsUnnormal');
    if (event.state !== 'OL' && event.state !== 'OL CHRG') {
      stateItem.sendCommand('ON');
    } else {
      stateItem.sendCommand('OFF');
    }
  },
  id: 'UPS-status-unnormal-boolean',
  tags: ['System', 'Energie', 'USV']
});

scriptLoaded = () => { // eslint-disable-line no-undef
  console.info('Script loaded.');
};
