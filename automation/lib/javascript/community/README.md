# JavaScript rules tools

Library functions, classes and modules to reuse in JavaScript rules. My focus on building these tools is to solve often needed tasks in a efficient and simple way. Providing fully realized capabilities is not the goal of this tools.

## Table of Contents
- [Table of Contents](#table-of-contents)
- [1. Prerequisites](#1-prerequisites)
- [2. Group Utilities](#2-group-utilities)
- [3. Item Control Utility](#3-item-control-utility)
  - [Create an instance of the Item Control Utility](#create-an-instance-of-the-item-control-utility)
  - [volumeDimming](#volumedimming)
- [4. Scene Engine](#4-scene-engine)

***
## 1. Prerequisites

* openHAB 3.x
* __IMPORTANT:__ This code is not compatible with the GraalVM JavaScript add-on.

Note: these tools are created for use in UI rules and scripts.


## 2. Group Utilities
***

[groupUtils.js](https://github.com/rkoshak/openhab-rules-tools/blob/main/group_utils/javascript/automation/lib/javascript/community/groupUtils.js) implements a class to simplify the work with openHAB groups.

Please visit [openhab-rules-tools](https://github.com/rkoshak/openhab-rules-tools/tree/main/group_utils).


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

## 4. Scene Engine
***
Please note that the sceneEngine has moved to the npm package [florianh-openhab-tools](https://www.npmjs.com/package/florianh-openhab-tools) 
and is now compatible with the GraalVM JavaScript addon.
