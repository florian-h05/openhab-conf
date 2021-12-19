/*
This script sends a thing's state to an openHAB item.

Items must follow this naming scheme: "<binding>:<...>:<name>"" with Item "<binding>_<name>_state"
e.g. for "knx:device:bridge:Wallswitch" Item "KNX_Wallswitch_state"

Copyright (c) 2021 Florian Hotze under MIT License
*/

const { actions, items, rules, triggers } = require('openhab');
let triggersList = [];

/**
 * Send a Thing's state to an openHAB Item.
 * @param {String} groupName name of the group
 * @param {String} thingPrefix thing id's prefix before the device name
 * @param {String} itemPrefix state item's prefix
 */
const updateThingStatus = (groupName, thingPrefix, itemPrefix) => {
  const members = items.getItem(groupName).members.map(item => item.name);
  for (let i = 0; i < members.length; i++) {
    const thing = thingPrefix + members[i].replace('_state', '').replace(itemPrefix, '');
    const thingStatus = String(actions.Things.getThingStatusInfo(thing));
    items.getItem(members[i]).postUpdate(thingStatus);
  }
};

/**
 * Returns the rule triggers.
 * @param {String} groupName name of the group
 * @param {String} thingPrefix thing id's prefix before the device name
 * @param {String} itemPrefix state item's prefix
 */
const getTriggers = (groupName, thingPrefix, itemPrefix) => {
  const members = items.getItem(groupName).members.map(item => item.name);
  for (let i = 0; i < members.length; i++) {
    const thing = thingPrefix + members[i].replace('_state', '').replace(itemPrefix, '');
    triggersList.push(triggers.ThingStatusChangeTrigger(thing));
  }
};

getTriggers('KNXState', 'knx:device:bridge:', 'KNX_');
getTriggers('YamahaState', 'yamahareceiver:yamahaAV:', 'Yamaha_');
triggersList.push(triggers.ThingStatusChangeTrigger('knx:ip:bridge:'));
triggersList.push(triggers.ItemCommandTrigger('ThingState_Refresh', 'ON'));

rules.JSRule({
  name: 'Thing State to Item',
  description: 'Send the things \' states on change to a state item.',
  triggers: triggersList,
  execute: data => {
    updateThingStatus('KNXState', 'knx:device:bridge:', 'KNX_');
    updateThingStatus('YamahaState', 'yamahareceiver:yamahaAV:', 'Yamaha_');
    // KNX IP Gateway
    const thingStatus = String(actions.Things.getThingStatusInfo('knx:ip:bridge'));
    items.getItem('KNX_IP_Gateway_state').postUpdate(thingStatus);
    // Update refresh button
    items.getItem('ThingState_Refresh').postUpdate('OFF');
  }
});
