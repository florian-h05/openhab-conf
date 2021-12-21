/*
Copyright (c) 2021 Florian Hotze under MIT License
*/

const { rules, triggers, items, time, actions } = require('openhab');
const logger = require('openhab').log('sbfspot-solar-JS');

rules.JSRule({
  name: 'Solar data: fetch from SBFspot',
  description: 'Fetch data from SMA inverter.',
  triggers: [
    triggers.ItemCommandTrigger('pv_refresh', 'ON'),
    triggers.GenericCronTrigger('0 0/5 5-22 * * ? *')
  ],
  execute: data => {
    logger.info('Fetching data from SBFspot.');
    const output = actions.Exec.executeCommandLine(time.Duration.ofSeconds(40), '/usr/local/bin/sbfspot.3/SBFspot', '-v', '-finq', '-nocsv', '-nosql');
    // Split by newline
    const response = output.split(/\r?\n/);
    let EToday, ETotal, powerOut;
    let string1Power, string1Voltage, string1Amperage;
    let string2Power, string2Voltage, string2Amperage;
    // Simple error checking.
    if (output.search('Done.') !== -1 && output.search('SBFspot') !== -1) {
      // Check for the given keywords.
      for (let i = 0; i < response.length; i++) {
        if (response[i].search('EToday') !== -1) {
          EToday = parseFloat(response[i].split(/:|kWh/)[1]);
        }
        if (response[i].search('ETotal') !== -1) {
          ETotal = parseFloat(response[i].split(/:|kWh/)[1]);
        }
        if (response[i].search('Total Pac') !== -1) {
          powerOut = parseFloat(response[i].split(/:|kW/)[1]);
        }
        if (response[i].search('String 1 Pdc') !== -1) {
          const str = response[i].split(/:|kW|V|A/);
          string1Power = parseFloat(str[1]);
          string1Voltage = parseFloat(str[3]);
          string1Amperage = parseFloat(str[5]);
        }
        if (response[i].search('String 2 Pdc') !== -1) {
          const str = response[i].split(/:|kW|V|A/);
          string2Power = parseFloat(str[1]);
          string2Voltage = parseFloat(str[3]);
          string2Amperage = parseFloat(str[5]);
        }
      }
      // post numbers to openHAB items
      items.getItem('pv_EToday').postUpdate(EToday);
      items.getItem('pv_ETotal').postUpdate(ETotal);
      items.getItem('pv_Power').postUpdate(powerOut);
      items.getItem('pv_string1_power').postUpdate(string1Power);
      items.getItem('pv_string1_voltage').postUpdate(string1Voltage);
      items.getItem('pv_string1_amperage').postUpdate(string1Amperage);
      items.getItem('pv_string2_power').postUpdate(string2Power);
      items.getItem('pv_string2_voltage').postUpdate(string2Voltage);
      items.getItem('pv_string2_amperage').postUpdate(string2Amperage);
      items.getItem('pv_lastRefresh').postUpdate(time.ZonedDateTime.now().withFixedOffsetZone().toString());
      logger.info('Data pull from SBFspot completed.');
    } else {
      // post numbers to openHAB items
      items.getItem('pv_EToday').postUpdate(0);
      items.getItem('pv_Power').postUpdate(0);
      items.getItem('pv_string1_power').postUpdate(0);
      items.getItem('pv_string1_voltage').postUpdate(0);
      items.getItem('pv_string1_amperage').postUpdate(0);
      items.getItem('pv_string2_power').postUpdate(0);
      items.getItem('pv_string2_voltage').postUpdate(0);
      items.getItem('pv_string2_amperage').postUpdate(0);
      logger.error('Data pull from SBFspot failed. Output: \n' + output);
    }
    items.getItem('pv_refresh').postUpdate('OFF');
  },
  id: 'solar-fetch-data'
});

rules.JSRule({
  name: 'Solar data: reset before midnight',
  description: 'Reset day data to 0 before the next day starts.',
  triggers: [
    triggers.GenericCronTrigger('0 58 23 * * ? *')
  ],
  execute: data => {
    items.getItem('pv_EToday').postUpdate(0);
  },
  id: 'solar-reset-endofday'
});

logger.info('Script loaded.');
