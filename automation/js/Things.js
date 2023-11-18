/*
Copyright (c) 2022 Florian Hotze under MIT License

Hosted at: https://github.com/florian-h05/openhab-conf

Depends on https://github.com/florian-h05/openhab-js-tools.
*/

// @ts-check

// CONFIGURE HERE AND AT THE BOTTOM OF THE FILE -----------------------------------------------------------------------

// DO NOT MODIFY ------------------------------------------------------------------------------------------------------
const { actions, items, rules, triggers, things } = require('openhab');
const { thingsx } = require('@hotzware/openhab-tools');

/**
 * Return rule to automatically reinitialize bridge when too many childs are offline.
 *
 * @param {String} groupName name of Group whose members store thing states
 * @param {String} bridgeUID UID of bridge
 */
const autoReEnableThingRule = (groupName, bridgeUID) => {
  rules.JSRule({
    name: `Automatic re-enabling of bridge ${bridgeUID}`,
    description: `Automatically re-enables the bridge when to many members of ${groupName} are offline.`,
    triggers: triggers.GroupStateChangeTrigger(groupName),
    execute: (event) => {
      setTimeout(() => {
        const group = items.getItem(groupName);
        const totalMembers = group.members.length;
        const offlineMembers = group.members.filter(item => item.state !== 'ONLINE').length;
        if (offlineMembers > (totalMembers / 2)) {
          thingsx.reEnableThing(bridgeUID);
        }
      }, 60000);
    }
  });
};

// CONFIGURE DOWN HERE ------------------------------------------------------------------------------------------------
// Automatically reinitializes bridge when too many childs are not online.
autoReEnableThingRule('KNXState', 'knx:ip:bridge');

// When Item KNX_ReInit receives command ON, Thing knx:ip:bridge is reactived.
thingsx.createReEnableThingWithItemRule('KNX_ReInit', 'knx:ip:bridge');

// Sets the state of each member of Item group KNXState to the matching Thing's state.
// Item-Thing matching: KNX_IP_Gateway = knx:ip:bridge, rest (example): KNX_demo_actuator_state = knx:device:bridge:demo:actuator
thingsx.createThingStatusRule('gKNXState', ['_state', 'KNX_IP_Gateway', 'KNX_'], ['', 'knx:ip:bridge', 'knx:device:bridge:']);
