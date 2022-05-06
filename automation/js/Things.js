/*
Copyright (c) 2022 Florian Hotze under MIT License

Hosted at: https://github.com/florian-h05/openhab-conf
*/

// CONFIGURE HERE AND AT THE BOTTOM OF THE FILE -----------------------------------------------------------------------
// Create an API token for an admin user in the user profile (click on your username on the bottom of the side bar).
const API_TOKEN = '';

// DO NOT MODIFY ------------------------------------------------------------------------------------------------------
const { actions, items, rules, triggers } = require('openhab');
const HashMap = Java.type('java.util.HashMap'); // eslint-disable-line no-undef

// Utility functions.

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
    thingname = thingname.replaceAll(patterns[i], replaces[i]);
  }
  return thingname;
};

/**
 * Re-enables/reinitializes a thing by UID.
 * The Thing is disabled and then enabled by using the REST API.
 *
 * @param {String} thingUID UID of thing
 */
const reEnableThing = (thingUID) => {
  // Set up headers for REST API requests.
  const headers = new HashMap();
  headers.put('Authorization', 'Bearer ' + API_TOKEN);
  // Set Thing to disabled.
  actions.HTTP.sendHttpPutRequest('http://localhost:8080/rest/things/' + thingUID.replaceAll(':', '%3A') + '/enable', 'text/plain', 'false', headers, 1000);
  // Set Thing to enabled.
  actions.HTTP.sendHttpPutRequest('http://localhost:8080/rest/things/' + thingUID.replaceAll(':', '%3A') + '/enable', 'text/plain', 'true', headers, 1000);
  console.info('Re-enabled Thing ' + thingUID);
};

// Rule creators.

/**
 * Return rule to reinitialize a Thing by Item.
 * The Thing is disabled and then enabled.
 *
 * @param {String} itemname name of Item
 * @param {String} thingUID UID of the Thing to reinitialize
 * @returns {rules.JSRule} {@link rules.JSRule}
 */
const itemReEnableThingRule = (itemname, thingUID) => {
  return rules.JSRule({
    name: 'Re-enable ' + thingUID + ' with switch Item',
    description: 'Disable and then enabled a Thing.',
    triggers: triggers.ItemCommandTrigger(itemname, 'ON'),
    execute: (event) => {
      reEnableThing(thingUID);
      // Set command Item to OFF.
      items.getItem(itemname).sendCommand('OFF');
    },
    tags: ['Things', 'System'],
    id: 'Thing_' + thingUID + '_reinitialize'
  });
};

/**
 * Return rule to automatically reinitialize bridge when too many childs are offline.
 *
 * @param {String} groupName name of Group whose members store thing states
 * @param {String} bridgeUID UID of bridge
 * @returns {rules.JSRule} {@link rules.JSRule}
 */
const autoReEnableThingRule = (groupName, bridgeUID) => {
  // Set up headers for REST API requests.
  const headers = new HashMap();
  headers.put('Authorization', 'Bearer ' + API_TOKEN);
  return rules.JSRule({
    name: `Automatic re-enabling of bridge ${bridgeUID}`,
    description: `Automatically re-enables the bridge when to many members of ${groupName} are offline.`,
    triggers: triggers.GroupStateChangeTrigger(groupName),
    execute: (event) => {
      setTimeout(() => {
        const group = items.getItem(groupName);
        const totalMembers = group.members.filter(item => item.state !== 'NULL');
        const offlineMembers = group.members.filter(item => item.state !== 'ONLINE').length;
        if (offlineMembers > (totalMembers / 2)) {
          reEnableThing(bridgeUID);
        }
      }, 60000);
    }
  });
};

/**
 * Return rule to send Thing states to Items.
 *
 * Replaces all "_" with ":" and removes "_state" from the Items' names.
 * @param {String} groupName name of the group
 * @param {String|Array<String>} patterns Patterns to replace.
 * @param {String|Array<String>} replaces String that is used for replacing.
 */
const thingState = (groupName, patterns, replaces) => {
  // Set up default triggers for thing status rules.
  const triggersList = [
    triggers.ItemCommandTrigger('ThingState_Refresh', 'ON'),
    triggers.SystemStartlevelTrigger(100),
    triggers.GenericCronTrigger('0 0/5 * * * *')
  ];
  // Add ThingStatusChangeTrigger for the matching Thing of each member Item.
  const members = items.getItem(groupName).members.map(item => item.name);
  for (let i = 0; i < members.length; i++) {
    const thing = getThingName(members[i], patterns, replaces);
    triggersList.push(triggers.ThingStatusChangeTrigger(thing));
  }
  // Return rule.
  return rules.JSRule({
    name: 'Thing: Send state to Item group ' + groupName,
    description: 'Send the things \' states on change to the matching state Items.',
    triggers: triggersList,
    execute: (event) => {
      // Update the state of each member Item with the matching Thing's state.
      const members = items.getItem(groupName).members.map(item => item.name);
      for (const i in members) {
        const thing = getThingName(members[i], patterns, replaces);
        const thingStatus = String(actions.Things.getThingStatusInfo(thing));
        items.getItem(members[i]).postUpdate(thingStatus);
      }
      // Update refresh button to off.
      items.getItem('ThingState_Refresh').postUpdate('OFF');
    },
    id: 'thing-state_' + groupName,
    tags: ['System', 'Things', 'Status']
  });
};

// CONFIGURE DOWN HERE ------------------------------------------------------------------------------------------------
// Automatically reinitializes bridge when too many childs are not online.
autoReEnableThingRule('KNXState', 'knx:ip:bridge');

// When Item KNX_ReInit receives command ON, Thing knx:ip:bridge is reactived.
itemReEnableThingRule('KNX_ReInit', 'knx:ip:bridge');

// Sets the state of each member of Item group KNXState to the matching Thing's state.
// Item-Thing matching: KNX_IP_Gateway = knx:ip:bridge, rest (example): KNX_demo_actuator_state = knx:device:bridge:demo:actuator
thingState('KNXState', ['KNX_IP_Gateway', 'KNX_'], ['knx:ip:bridge', 'knx:device:bridge:']);
