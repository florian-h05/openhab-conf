/*
Rules required to use the shaddow.py script.

Copyright (c) 2021 Florian Hotze under MIT License

Hosted at: https://github.com/florian-h05/openhab-conf
*/

// @ts-check

const { rules, actions } = require('openhab');

rules.when().channel('astro:sun:home:set#event').triggered('START').then().copyAndSendState().fromItem('Sun_Azimuth').toItem('Sunset_Azimuth').build('Astro: Sonnenuntergang speichern', '... in Item Sunset_Azimuth.', ['shaddow.py']);

rules.when().channel('astro:sun:home:rise#event').triggered('START').then().copyAndSendState().fromItem('Sun_Azimuth').toItem('Sunrise_Azimuth').build('Astro: Sonnenaufgang speichern', '... in Item Sunrise_Azimuth.', ['shaddow.py']);

rules.when().item('Sun_Azimuth').changed().then(e => {
  actions.Exec.executeCommandLine('/usr/bin/python3', '/etc/openhab/scripts/3shaddow.py', 'update');
}).build('shaddow.py: Update', '... bei Änderung von Azimut.', ['shaddow.py']);
