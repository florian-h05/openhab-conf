/*
Copyright (c) 2021 Florian Hotze under MIT License
*/

const { rules, triggers, items, time, actions } = require('openhab');
const logger = require('openhab').log('nina-warnings-JS');

rules.JSRule({
  name: 'NINA get warnings',
  description: 'Fetches warnings from the German NINA service',
  triggers: [
    triggers.GenericCronTrigger('0 0/5 * * * *')
  ],
  execute: data => {
    const output = actions.Exec.executeCommandLine(time.Duration.ofSeconds(10), 'bash', '/etc/openhab/scripts/NINA_Warn.bash', '-w');
    const weather = output.split(/\r?\n/);
    let previousIteration;
    for (let n = 0; n < weather.length && n < 4; n++) {
      const i = n + 1;
      if (weather[n].search('WARNUNG') !== -1) {
        weather[n].replace('Amtliche ', '');
        if (previousIteration !== weather[n]) {
          items.getItem('NINA_WetterWarn' + i).postUpdate(weather[n]);
        } else {
          items.getItem('NINA_WetterWarn' + i).postUpdate('None.');
        }
        previousIteration = weather[n];
      } else {
        items.getItem('NINA_WetterWarn' + i).postUpdate('None.');
      }
    }
  },
  id: 'NINA-get-warnings'
});

logger.info('Script loaded.');
