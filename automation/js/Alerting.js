/*
Copyright (c) 2021 Florian Hotze under MIT License

See openhab-js-tool alerting - https://florian-h05.github.io/openhab-js-tools/rulesx.alerting.html for alerting rules.

Hosted at: https://github.com/florian-h05/openhab-conf
*/

const { rules, triggers, items } = require('openhab');
const logger = require('openhab').log('alerting-JS');

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
  },
  id: 'alarm-status-string',
  tags: ['Alarme', 'Status']
});

// Generates the frost level.
rules.JSRule({
  name: 'Frost Level',
  description: 'Determines the level of frost.',
  triggers: [
    triggers.SystemStartlevelTrigger(100),
    triggers.ItemStateChangeTrigger('Aussentemperatur'),
    triggers.ItemCommandTrigger('Frostalarm_send')
  ],
  execute: data => {
    const temp = parseFloat(items.getItem('Aussentemperatur').state);
    const activate = items.getItem('Frostalarm_send').state === 'ON';
    const frostLevelPrev = parseInt(items.getItem('Frost_Stufe').state);
    let frostLevel;
    if (activate === true) {
      if ((temp <= 12) && (temp > 5)) {
        frostLevel = 1; // warning
      } else if ((temp <= 5) && (temp > 2)) {
        frostLevel = 3; // warning
      }
    } else if (activate === false) {
      frostLevel = 0;
    }
    // alarms could not be deactivated
    if (temp <= 2) {
      frostLevel = 4; // alarm
    } else if (temp > 12) {
      frostLevel = 0; // nothing
    }
    if (frostLevelPrev !== frostLevel) {
      logger.info('frostLevel changed from ' + frostLevelPrev + ' to ' + frostLevel);
      items.getItem('Frost_Stufe').postUpdate(frostLevel);
    }
  },
  id: 'frost-level'
});

// Generates the heat level.
rules.JSRule({
  name: 'Heat Level',
  description: 'Determines the level of heat.',
  triggers: [
    triggers.SystemStartlevelTrigger(100),
    triggers.ItemStateChangeTrigger('Aussentemperatur'),
    triggers.ItemCommandTrigger('Hitzealarm_send')
  ],
  execute: data => {
    const temp = parseFloat(items.getItem('Aussentemperatur').state);
    const activate = items.getItem('Hitzealarm_send').state === 'ON';
    const heatLevelPrev = parseInt(items.getItem('Hitze_Stufe').state);
    let heatLevel;
    // warnings can be turned off & on
    if (activate === 'ON') {
      if ((temp >= 25) && (temp < 28)) {
        heatLevel = 1; // warning
      } else if ((temp >= 28) && (temp < 32)) {
        heatLevel = 2; // warning
      }
    } else if (activate === 'OFF') {
      heatLevel = 0; // nothing
    }
    // alarms could not be deactivated
    if (temp >= 32) {
      heatLevel = 4; // alarm
    } else if (temp < 25) {
      heatLevel = 0; // nothing
    }
    if (heatLevelPrev !== heatLevel) {
      logger.info('heatLevel changed from ' + heatLevelPrev + ' to ' + heatLevel);
      items.getItem('Hitze_Stufe').postUpdate(heatLevel);
    }
  },
  id: 'heat-level'
});

logger.info('Script loaded.');
