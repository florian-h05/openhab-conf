/*
This script sends a thing's state to an openHAB item.

Items' names must end with "_state". 
The Item "ThingState_Refresh" is required.

Copyright (c) 2021 Florian Hotze under MIT License
*/

const { actions, items, rules, triggers } = require('openhab');
let triggersList = [
  triggers.ItemCommandTrigger('ThingState_Refresh', 'ON'),
  triggers.SystemStartlevelTrigger(100), 
  triggers.GenericCronTrigger('0 0/5 * * * *')
];

/**
 * Get a Thing's name from the Item name.
 * Always "_state" is removed first.
 * Next, patterns is replaced with replaces. If patterns is an Array, replaces must be an Array, search-replace pairs must have the same index.
 * @param {String} itemname Item's name
 * @param {String|Array<String>} patterns Patterns to replace.
 * @param {String|Array<String>} replaces String that is used for replacing.
 */
const getThingName = (itemname, patterns, replaces) => {
  if (typeof patterns === 'string') return itemname.replace('_state', '').replaceAll(patterns, replaces);
  // When patterns and replaces are Arrays.
  let thingname = itemname.replace('_state', '');
  for (const i in patterns) {
    thingname = thingname.replaceAll(patterns[i], replaces[i])
  };
  return thingname;
};

/**
 * Send a Thing's state to an openHAB Item.
 * Replaces all "_" with ":" and removes "_state".
 * @param {String} groupName name of the group
 * @param {String|Array<String>} patterns Patterns to replace.
 * @param {String|Array<String>} replaces String that is used for replacing.
 */
const updateThingStatus = (groupName, patterns, replaces) => {
  const members = items.getItem(groupName).members.map(item => item.name);
  for (let i = 0; i < members.length; i++) {
    const thing = getThingName(members[i], patterns, replaces);
    const thingStatus = String(actions.Things.getThingStatusInfo(thing));
    items.getItem(members[i]).postUpdate(thingStatus);
  }
};

/**
 * Returns the rule triggers.
 * Replaces all "_" with ":" and removes "_state".
 * @param {String} groupName name of the group
 * @param {String|Array<String>} patterns Patterns to replace.
 * @param {String|Array<String>} replaces String that is used for replacing.
 */
const getTriggers = (groupName, patterns, replaces) => {
  const members = items.getItem(groupName).members.map(item => item.name);
  for (let i = 0; i < members.length; i++) {
    const thing = getThingName(members[i], patterns, replaces);
    triggersList.push(triggers.ThingStatusChangeTrigger(thing));
  }
};

/* CONFIGURE RULE HERE ------------------------------------------------------------------------------------- */

getTriggers('KNXState', ['KNX_IP_Gateway', 'KNX_'], ['knx:ip:bridge', 'knx:device:bridge:']);
getTriggers('YamahaState', '_', ':');

rules.JSRule({
  name: 'Thing State to Item',
  description: 'Send the things \' states on change to a state item.',
  triggers: triggersList,
  execute: data => {
    updateThingStatus('KNXState', ['KNX_IP_Gateway', 'KNX_'], ['knx:ip:bridge', 'knx:device:bridge:']);
    updateThingStatus('YamahaState', '_', ':');
    // Update refresh button
    items.getItem('ThingState_Refresh').postUpdate('OFF');
  },
  id: 'thing-state',
  tags: ['System', 'Things', 'Status']
});
