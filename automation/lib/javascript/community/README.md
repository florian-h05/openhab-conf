# JavaScript rules tools

Library functions, classes and modules to reuse in JavaScript rules. My focus on building these tools is to solve often needed tasks in a efficient and simple way. Providing fully realized capabilities is not the goal of this tools.

## Table of Contents
- [Table of Contents](#table-of-contents)
- [1. Prerequisites](#1-prerequisites)
- [2. Group Utilities](#2-group-utilities)
  - [Create an instance of the Group Utilities](#create-an-instance-of-the-group-utilities)
  - [getMembers](#getmembers)
  - [getAllMembers](#getallmembers)
  - [arithmetic](#arithmetic)
  - [count](#count)
  - [Tests](#tests)
- [3. Item Control Utility](#3-item-control-utility)
  - [Create an instance of the Item Control Utility](#create-an-instance-of-the-item-control-utility)
  - [volumeDimming](#volumedimming)

***
## 1. Prerequisites

* openHAB 3.x
* __IMPORTANT:__ This code is not compatible with the GraalVM JavaScript add-on.

Note: these tools are created for use in UI rules and scripts.


## 2. Group Utilities
***

[groupUtils.js](./groupUtils.js) implements a class to simplify the work with openHAB groups.
It allows you to get members of a group, to perform arithmetic operations on members' states and to count states matching a given expression.
There are no dependencies.

### Create an instance of the Group Utilities
```javascript
this.OPENHAB_CONF = (this.OPENHAB_CONF === undefined) ? java.lang.System.getenv("OPENHAB_CONF") : this.OPENHAB_CONF
load(OPENHAB_CONF+'/automation/lib/javascript/community/groupUtils.js')
var GroupUtils = new GroupUtils()
```

### getMembers
This function returns the names, the labels or the states of direct group members as an array.
```javascript
var group = GroupUtils.getMembers(groupname, characteristic)

// example
// the states of direct members of "windows"
var windows = GroupUtils.getMembers('windows', 'state') 
```
Argument | Purpose | Required
-|-|-
`groupname` | The name of the group. | no
`characteristic` | Defines what you get from the members. Valid are: name (default), label, state. | yes

### getAllMembers
This function returns the names, the labels or the states of direct and child group members. The group items are excluded from the array.
```javascript
var group = GroupUtils.getAllMembers(groupname, characteristic)

// example
// the names of all (direct & child) members of "doors"
var name = GroupUtils.getMembers('doors', 'name') // the same as ...getMembers('doors')
```
Argument | Purpose | Required
-|-|-
`groupname` | The name of the group. | no
`characteristic` | Defines what you get from the members. Valid are: name (default), label, state. | yes

### arithmetic
Perform arithmetic operations on the states of Number members. This functionality is the same as in the openHAB [group item definition](https://www.openhab.org/docs/configuration/items.html#derive-group-state-from-member-items). The function returns the value from the given function.
```javascript
// get the states
var group = GroupUtils.getMembers(groupname, 'state')

// perform arithmetic operation
var arithmetic = GroupUtils.arithmetic(items, func)

// examples
var power = GroupUtils.getMembers('power', 'state') // the states of direct members of "power"
var max = GroupUtils.arithmetic(power, 'MAX') // the highest value from "power"
var min = GroupUtils.arithmetic(power, 'MIN') // the lowest value from "power"
var avg = GroupUtils.arithmetic(power, 'AVG') // the average value from "power"
var sum = GroupUtils.arithmetic(power, 'SUM') // the summarized value from "power"
```
Argument | Purpose | Required
-|-|-
`items` | The array of item states. | yes
`func` | Defines which function to perform, valid: MAX, MIN, AVG, SUM. | yes

### count
Count the states matching a given comparison expression. This functionality is the same as in the openHAB [group item definition](https://www.openhab.org/docs/configuration/items.html#derive-group-state-from-member-items).
The function returns how many members match the given comparison expression.
```javascript
// get the states
var items = GroupUtils.getMembers(groupname, 'state')
// count
var counter = GroupUtils.count(items, op, comp)

// examples
var lights = GroupUtils.getMembers('lights', 'state') // the states of direct members of "lights"
var lightsOFF = GroupUtils.count(lights, 'equal', 'OFF') // the number of lights off
var lightsNotOFF = GroupUtils.count(lights, 'notEqual', 'OFF') // the number of lights not off

var temp = GroupUtils.getMembers('temperatures', 'state') // the states of direct members of "temperatures"
var larg24 = GroupUtils.count(temp, 'larger', 24) // the number of states higher than 24
var smal24 = GroupUtils.count(temp, 'smaller', 24) // the number of states lower than 24
var largEq24 = GroupUtils.count(temp, 'smallerEqual', 24) // the number of states lower or equal than/to 24
var smalEq24 = GroupUtils.count(temp, 'largerEqual', 24) // the number of states higher or equal than/to 24
```
Argument | Purpose | Required
-|-|-
`items` | The array of item states. | yes
`op` | The comparison operator, available: equal, notEqual, larger, largerEqual, smaller, smallerEqual. | yes
`comp` | The value to compare with, e.g. numbers, ON/OFF states or strings. | yes

### Tests
There are no tests, as the library has no dependencies it should always work.


## 3. Item Control Utility
***

[itemControl.js](./itemControl.js) implements a class to easily execute often used command sequences on Items.
Currently, it provides a dimmer for sound/speaker volume.
There are no dependencies.

### Create an instance of the Item Control Utility
```javascript
this.OPENHAB_CONF = (this.OPENHAB_CONF === undefined) ? java.lang.System.getenv("OPENHAB_CONF") : this.OPENHAB_CONF
load(OPENHAB_CONF+'/automation/lib/javascript/community/itemControl.js')
/*
Every time a rule is created or update it is given a context. This persists the function in the context, 
so every time it is called, the functions can access values from before.
*/
this.ic = (this.ic === undefined) ? new ItemControl() : this.ic
```

The class provides one functions:

### volumeDimming
This function dimms a sound/speakervolume to a given target volume. For example, I use it to have a smooth transision to a new volume level on my Yamaha amplifiers.
```javascript
this.ic.volumeDimming(dummyItem, realItem, timePerStep)
```
Argument | Purpose | Required
-|-|-
`dummyItem` | Name of the openHAB item that represents the target value and the state. | yes
`realItem` | Name of the openHAB item that controls the volume. | yes
`timePerStep` | Time for each step in milliseconds. | yes
```javascript
// example
this.ic.volumeDimming('Amplifier_Volume', 'Amplifier_RealVolume', 333)
```
This does the following:
* get the target volume from the dummy item `Amplifier_Volume`
* increase or decrease the real volume (item `Amplifier_RealVolume`) by 1 step every 1/3 second
* update the state of the dummy item after each step