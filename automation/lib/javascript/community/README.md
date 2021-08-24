# JavaScript rules tools

Library functions, classes and modules to reuse in JavaScript rules. My focus on building these tools is to solve often needed tasks in a efficient and simple way. Providing fully realized capabilities is not the goal of this tools.

## Table of contents
* [1. Prerequisites](#1-prerequisites)
* [2. Group utilities](#2-group-utilities)

***
## 1. Prerequisites

* openHAB 3.x
* __IMPORTANT:__ This code is not compatible with the GraalVM JavaScript add-on.

Note: these tools are created for use in UI rules and scripts.

***
## 2. Group utilities

[groupUtils.js](./groupUtils.js) implements a class to simplify the work with openHAB groups.
It allows you to get members of a group, to perform arithmetic operations on members' states and to count states matching a given expression.
There are no dependencies.

### How it works:

Load the class into your script:
```javascript
this.OPENHAB_CONF = (this.OPENHAB_CONF === undefined) ? java.lang.System.getenv("OPENHAB_CONF") : this.OPENHAB_CONF
load(OPENHAB_CONF+'/automation/lib/javascript/community/groupUtils.js')
var GroupUtils = new GroupUtils()
```

The class provides four functions:

### getMembers

This function returns the names, the labels or the states of direct group members as an array.

```javascript
var group = GroupUtils.getMembers(groupname, characteristic)
```
* _groupname_ is the name of the group.
* _characteristic_ defines what you get from the members. Valid are: name (default), label, state; this parameter is not required.

### getAllMembers

This function returns the names, the labels or the states of direct and child group members. The group items are excluded from the array.

```javascript
var group = GroupUtils.getAllMembers(groupname, characteristic)
```
* _groupname_ is the name of the group.
* _characteristic_ defines what you get from the members. Valid are: name (default), label, state; this parameter is not required.

### arithmetic

Perform arithmetic operations on the states of Number members. This functionality is the same as in the openHAB [group item definition](https://www.openhab.org/docs/configuration/items.html#derive-group-state-from-member-items).
You have to pass the states as an array to this function.

```javascript
// get the states
var group = GroupUtils.getMembers(groupname, 'state')

// perform arithmetic operation
var arithmetic = GroupUtils.arithmetic(items, func)

// examples
var max = GroupUtils.arithmetic(group, 'MAX')
var min = GroupUtils.arithmetic(group, 'MIN')
var avg = GroupUtils.arithmetic(group, 'AVG')
var sum = GroupUtils.arithmetic(group, 'SUM')
```
These two parameters are required:
* _items_ is the array of states
* _func_ defines which function to perform, valid: MAX, MIN, AVG, SUM

### count

Count the states matching a given comparison expression. This functionality is the same as in the openHAB [group item definition](https://www.openhab.org/docs/configuration/items.html#derive-group-state-from-member-items).
You have to pass the states as an array to this function.

```javascript
// get the states
var group = GroupUtils.getMembers(groupname, 'state')

// count
var counter = GroupUtils.count(items, op, comp)

// examples
var larg24 = GroupUtils.count(group, 'larger', 24)
var smal24 = GroupUtils.count(group, 'smaller', 24)
var largEq24 = GroupUtils.count(group, 'smallerEqual', 24)
var smalEq24 = GroupUtils.count(group, 'largerEqual', 24)
```
These three parameters are required:
* _items_ is the array of states
* _op_ is the comparison operator, available: equal, notEqual, larger, largerEqual, smaller, smallerEqual
* _comp_ is the value to compare with, e.g. numbers or ON/OFF states

