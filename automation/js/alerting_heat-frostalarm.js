/*
Copyright (c) 2022 Florian Hotze under MIT License

Extends alerting.js with frost- and heatalarms.
Hosted at: https://github.com/florian-h05/openhab-conf
*/

// CONFIGURATION ------------------------------------------------------------------------------------------------------
const CONTACTS_GROUPNAME = 'KontakteAufZu';
const ROOFWINDOW_TAG = 'Dachfenster'; // Roofwindow Items need this tag to be identified as roofwindow.
const ITEM_TEMPERATURE_SUFFIX = '_Temperatur'; // for ${roomname}${suffix} the suffix
const ITEM_ROOFWINDOWSTATE_SUFFIX = '_Fenster_Status_num'; // for ${roomname}${suffix} the suffix, Item holds a numeric representation of roofwindow state
const ITEM_IGNORE_LIST = []; // Ignore those Items.
const ITEM_OUTSIDE_TEMPERATURE = 'Aussentemperatur';

const FROSTALARM_CONF = {
  type: 'frostalarm',
  alarmLevelItem: 'Frost_Stufe',
  timeUntilAlarm: { // Time until an alarm is sent.
    open: 15,
    halfOpen: 20, // window is tilted or roofwindow is on "große Lüftung"
    klLueftung: 25, // roofwindow is on "kleine Lüftung"
    addForWarning: 10 // Time to add when its only a warning.
  },
  tempTreshold: -2, // Temperature treshold, for difference between inside temp to outside. Example: -2 means at least 2 degrees lower temp on the outside.
  notification: {
    alarm: {
      title: 'Frostalarm: ',
      message: ' schließen, zu kalt zum Lüften!'
    },
    warning: {
      title: '',
      message: ' schließen, zu kalt zum Lüften.'
    }
  }
};
const HEATALARM_CONF = {
  type: 'heat',
  alarmLevelItem: 'Hitze_Stufe',
  timeUntilAlarm: { // Time until an alarm is sent.
    open: 15,
    halfOpen: 20, // window is tilted or roofwindow is on "große Lüftung"
    klLueftung: 25, // roofwindow is on "kleine Lüftung"
    addForWarning: 10 // Time to add when its only a warning.
  },
  tempTreshold: -2, // Temperature treshold, for difference between inside temp to outside. Example: -2 means at least 2 degrees lower temp on the outside.
  notification: {
    alarm: {
      title: 'Hitzealarm: ',
      message: ' schließen, zu warm zum Lüften!'
    },
    warning: {
      title: '',
      message: ' schließen, zu warm zum Lüften.'
    }
  }
};

// DO NOT MODIFY ------------------------------------------------------------------------------------------------------
const { rules, triggers, items, actions } = require('openhab');
const { TimerMgr } = require('openhab_rules_tools/timerMgr');

const FROSTALARM_TIMERMGR = new TimerMgr();
const HEATALARM_TIMERMGR = new TimerMgr();

/**
 * Get the temperature difference from the temperature in a room to the outside temperature.
 *
 * The contact's Itemname must start with the room's name followed by an underscore (_).
 * The temperatures's Itemname must be: ${roomname}_Temperatur.
 *
 * @param {String} contactItem name of contact Item
 * @param {Number} outsideTemperature outside temperature as float
 * @returns {Number|null} temperature difference or null if no inside temperature is available
 */
const getTemperatureDifferenceInToOut = (contactItem, outsideTemperature) => {
  const roomName = contactItem.split('_')[0];
  const temperatureItem = items.getItem(roomName + ITEM_TEMPERATURE_SUFFIX, true);
  if (temperatureItem == null) return null;
  const insideTemperature = parseFloat(temperatureItem.state);
  return outsideTemperature - insideTemperature;
};

/**
 * Called when the timer expires.
 * It calls the {@link checkContact} function with calledOnExpire = true
 *
 * @param {*} timerMgr an instance of TimerMgr from openhab_rules_tools
 * @param {Object} alarmConf alarm configuration object
 * @param {String} contactItem name of contact Item
 */
const timerExpired = (timerMgr, alarmConf, contactItem) => {
  return function () {
    const outsideTemperature = parseFloat(items.getItem(ITEM_OUTSIDE_TEMPERATURE).state);
    scheduleOrPerformAlarm(timerMgr, alarmConf, contactItem, outsideTemperature, true);
  };
};

/**
 * Schedules a timer for a given contact or sends the notification.
 * Checks whether all conditions are met.
 *
 * @param {*} timerMgr an instance of TimerMgr from openhab_rules_tools
 * @param {Object} alarmConf alarm configuration object
 * @param {String} contactItem name of contact Item
 * @param {Number} outsideTemperature outside temperature as float
 * @param {Boolean} [calledOnExpire=false] if true, send notification
 * @param {Number} [time] time in minutes until timer expires, not required if calledOnExpire === true
 */
const scheduleOrPerformAlarm = (timerMgr, alarmConf, contactItem, outsideTemperature, calledOnExpire = false, time) => {
  console.info(`checkContact: Checking ${contactItem} (called from expired timer: ${calledOnExpire}).`);
  // If contact is closed, return false.
  if (items.getItem(contactItem).state === 'CLOSED') {
    if (timerMgr.hasTimer(contactItem)) {
      timerMgr.cancel(contactItem);
      return console.info(`checkContact: ${contactItem} is closed, cancelling timer.`);
    }
    return console.info(`checkContact: ${contactItem} is closed, returning.`);
  }
  const alarmLevel = parseInt(items.getItem(alarmConf.alarmLevelItem).state);
  // If alarmLevel indicates no alarm or warning, return false.
  if (alarmLevel === 0) return console.info('checkContact: No alarms or warning should be sent, returning.');
  const temperatureDifferenceInOut = getTemperatureDifferenceInToOut(contactItem, outsideTemperature);
  const tresholdReached = (temperatureDifferenceInOut == null) ? true : (alarmConf.tempTreshold < 0) ? (temperatureDifferenceInOut <= alarmConf.tempTreshold) : (temperatureDifferenceInOut >= alarmConf.tempTreshold);
  // If tempTreshold is not reached, return false.
  if (tresholdReached === false) return console.info(`checkContact: Temperature treshold for ${contactItem} (${alarmConf.type}) not reached, returning.`);
  // Send notification if called on expire of timer.
  if (calledOnExpire === true) {
    console.info(`Timer for ${contactItem} (${alarmConf.type}) expired, sending notification.`);
    if (alarmLevel === 4) return actions.NotificationAction.sendBroadcastNotification(`${alarmConf.notification.alarm.title}${items.getItem(contactItem).label}${alarmConf.notification.alarm.message}`);
    return actions.NotificationAction.sendBroadcastNotification(`${alarmConf.notification.warning.title}${items.getItem(contactItem).label}${alarmConf.notification.warning.message}`);
  }
  // If not called on expire of timer, schedule timer.
  const timerTime = (alarmLevel !== 4) ? time + alarmConf.timeUntilAlarm.addForWarning + 'm' : time + 'm';
  if (timerMgr.hasTimer(contactItem)) {
    console.info(`checkContact: Timer for ${contactItem} (${alarmConf.type}) already exists, skipping!`);
  } else {
    timerMgr.check(contactItem, timerTime, timerExpired(timerMgr, alarmConf = FROSTALARM_CONF, contactItem));
    console.info(`checkContact: Created timer for ${contactItem} (${alarmConf.type}) with time ${timerTime}.`);
  }
};

const isRoofwindow = (contactItem) => {
  const tags = items.getItem(contactItem).tags;
  return tags.includes(ROOFWINDOW_TAG);
};

const getTimeForRoofwindow = (contactItem, alarmConf) => {
  const roomName = contactItem.split('_')[0];
  const stateNum = parseFloat(items.getItem(roomName + ITEM_ROOFWINDOWSTATE_SUFFIX).state);
  switch (stateNum) {
    case 0.6:
      return alarmConf.timeUntilAlarm.klLueftung;
    case 0.3:
      return alarmConf.timeUntilAlarm.halfOpen;
    default:
      return alarmConf.timeUntilAlarm.open;
  }
};

/**
 * Decides whether to run frostalarm or heatalarm.
 *
 * @param {String} contactItem name of contact Item
 * @param {Number} outsideTemperature outside temperature as float
 */
const checkContact = (contactItem, outsideTemperature) => {
  if (!ITEM_IGNORE_LIST.includes(contactItem)) {
    if (parseInt(items.getItem(FROSTALARM_CONF.alarmLevelItem).state) !== 0) {
      const timerTime = (isRoofwindow(contactItem) === true) ? getTimeForRoofwindow(contactItem, FROSTALARM_CONF) : FROSTALARM_CONF.timeUntilAlarm.open;
      scheduleOrPerformAlarm(FROSTALARM_TIMERMGR, FROSTALARM_CONF, contactItem, outsideTemperature, false, timerTime);
    } else if (parseInt(items.getItem(HEATALARM_CONF.alarmLevelItem).state) !== 0) {
      const timerTime = (isRoofwindow(contactItem) === true) ? getTimeForRoofwindow(contactItem, HEATALARM_CONF) : HEATALARM_CONF.timeUntilAlarm.open;
      scheduleOrPerformAlarm(HEATALARM_TIMERMGR, HEATALARM_CONF, contactItem, outsideTemperature, false, timerTime);
    }
  }
};

rules.JSRule({
  name: 'Frost- & Hitzealarm',
  description: 'Sendet eine Benachrichtigung wenn ein Fenster/eine Tür offen ist und es zu kalt/warm ist ...',
  triggers: [
    triggers.GroupStateChangeTrigger(CONTACTS_GROUPNAME),
    triggers.ItemStateChangeTrigger(ITEM_OUTSIDE_TEMPERATURE)
  ],
  execute: (event) => {
    const outsideTemperature = parseFloat(items.getItem(ITEM_OUTSIDE_TEMPERATURE).state);
    if (event.itemName === ITEM_OUTSIDE_TEMPERATURE) {
      const members = items.getItem(CONTACTS_GROUPNAME).members;
      for (const i in members) {
        checkContact(members[i].name, outsideTemperature);
      }
    } else {
      if (!ITEM_IGNORE_LIST.includes(event.itemName)) {
        checkContact(event.itemName, outsideTemperature);
      }
    }
  },
  tags: ['Alarme'],
  id: 'frost-heatalarm'
});
