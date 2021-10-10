# openHAB configuration [@florian-h05](https://github.com/florian-h05)


***
## Table of Contents
* [1. JavaScript rules tools](#1-javascript-rules-tools)
    * [1.1 Prerequisites](#11-prerequisites)
    * [1.2 Group Utilities](#12-group-utilities)
    * [1.3 Item Control Utility](#13-item-control-utility)
* [2. Color design](#2-color-design)
    * [2.1 Color pairs](#21-color-pairs)
* [3. Widgets](#3-widgets)
    * [3.1 Widget design](#31-widget-design)
        * [3.1.1 Widget style](#311-widget-style)
        * [3.1.2 Icons](#312-icons)
        * [3.1.3 Text](#313-text)
* [4. Scripts](#4-scripts)
    * [4.1 shaddow.py](#41-shaddow-py)
    * [4.2 openhab-log-influxb.py](#42-openhab-log-influxb-py)

***
## 1. JavaScript rules tools

Library functions, classes and modules to reuse in JavaScript rules. My focus on building these tools is to solve often needed tasks in a efficient and simple way. Providing fully realized capabilities is not the goal of this tools.

### 1.1 Prerequisites

* openHAB 3.x
* __IMPORTANT:__ This code is not compatible with the GraalVM JavaScript add-on.

Note: these tools are created for use in UI rules and scripts.

### 1.2 Group Utilities

[groupUtils.js](/automation/lib/javascript/community/README.md) implements a class to simplify the work with openHAB groups.
It allows you to get members of a group, to perform arithmetic operations on members' states and to count states matching a given expression.

### 1.3 Item Control Utility

[itemControl.js](/automation/lib/javascript/community/itemControl.js) implements a class to easily execute often used command sequences on Items.
Currently, it provides a dimmer for sound/speaker volume.

For more information, have a look at the [README](/automation/lib/javascript/community).

***
## 2. Color design

For color design, I usually use the [Material Design color palette](https://material.io/resources/color/).
I choose colors from the __400__ or the __600__ series.
For the light mode I take the normal color or the dark color variation, for dark mode the light color variation.

Some widgets support to use a light and a dark background color, these widgets' description includes: _Supports light and dark background._
These widgets also have the option to invert the color of all texts and icons to reach an appropiate level of contrast.

This code-block enables light and dark background for widgets:
```yaml
...
    - description: rgba or HEX
      label: Background Color (lightmode)
      name: bgcolor
      required: false
      type: TEXT
    - description: rgba or HEX
      label: Background Color darkmode
      name: bgcolor_dark
      required: false
      type: TEXT
    - description: invert text color for light and dark mode
      label: Invert text color
      name: invertText
      required: false
      type: BOOLEAN
...
    # for background (in f7-card config):
      background-color: "=props.bgcolor ? (props.bgcolor_dark ? (themeOptions.dark === 'dark' ? props.bgcolor_dark : props.bgcolor) : props.bgcolor) : ''"
    # for text:
      color: "=props.invertText ? (props.invertText == true ? (themeOptions.dark === 'dark' ? 'black' : 'white') : '') : ''"
```

### 2.1 Color pairs

Which color pairs do I use for which color?
* Green: ```(themeOptions.dark === 'dark' ? '#76d275' : '#00701a')```
* Yellow: ```(themeOptions.dark === 'dark' ? '#ffff6b' : '#c5a600')```
* Orange: ```(themeOptions.dark === 'dark' ? '#ffbc45' : '#c25e00')```
* Red: ```(themeOptions.dark === 'dark' ? '#e53735' : '#ab000d')```

These color pairs are all from color series __600__.

***
## 3. Widgets

My custom widget set for the openHAB 3 MainUI.
Feel free to use or modify [these widgets](/UI/widgets). Information for each widget can be found [here](/UI/widgets).

### 3.1 Widget design


#### 3.1.1 Widget style

My custom widgets always use this design:
```yaml
...
component: f7-card
config:
  style:
    noShadow: false
    padding: 0px
    border-radius: var(--f7-card-expandable-border-radius)
    box-shadow: 5px 5px 10px 1px rgba(0,0,0,0.1)
    background-color: "=props.bgcolor ? props.bgcolor : ''"
    height: 120px
    margin-left: 5px
    margin-right: 5px
slots:
...
```
The _background-color_ attribute varies if the widget supports light and dark backgrounds. For more information have a look at [design guidelines](#design-guidelines).

The _height_ attribute usually varies between three sizes:
* __120px__ for normal-sized widgets
* __150px__ for large widgets with much content and controls
* __130px__ for the room card, which is not combined with other cards on one page

#### 3.1.2 Icons

Most icons are from [Framework7](https://framework7.io/icons/). 
Sometimes, openHAB icons are used, e.g. for state representation. 

_Framework7_ icons normally use these sizes:
* small icon (with small text, e.g. upper left corner): __18__
* standard icon (with standard text): __20__

_openHAB_ icons' size varies.

#### 3.1.3 Text

Text style follows these guidelines:
* small text (e.g. upper left corner): ```font-size: 12px```
* standard text: ```font-size: 16px```
* header text: ```font-size: 17px``` & ```font-weight: 600```
* sub-header text: ```font-size: 12px```
* large text (for state representation, e.g. in widget contact): ```font-size: 24px``` & ```font-weight: 400```

***
## 4. Scripts

Scripts for the _openhab-conf/scripts_ folder.

### 4.1 shaddow.py

This script was originally written by [@pmpkk](https://github.com/pmpkk) at [openhab-habpanel-theme-matrix](https://github.com/pmpkk/openhab-habpanel-theme-matrix).
I only modified it to work with _Python 3_ and the new _InfluxDB 2.x_. 

[shaddow.py](/scripts/shaddow.py) generates a _.svg_ image to illustrate where the sun is currently positioned, which site of the house is facing the sun and where the shaddow of your house is.
I added the position of the moon to the image. 

Please look at [this guide](/scripts/SHADDOW.md).

### 4.2 openhab-log-influxdb.py

A log for your smart home with [openhab-log-influxdb.py](../openhab/openhab-log-influxdb.py).

Create a log of your smart home in InfluxDB with the following data:
* log message
* device
* temperature
* windspeed
* brightness
* rain
* elevation
* azimuth

__How to setup:__
* line 30: set ``base_url`` to _openHAB_ hostname/address and append ``/rest``
* lines 34 to 39: setup _InfluxDB_
* lines 52 to 57: set your _openHAB_ items in ``items.get('<itemname>').state``
