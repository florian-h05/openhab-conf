# openHAB configuration [@florian-h05](https://github.com/florian-h05)

***
## Table of Contents
- [Table of Contents](#table-of-contents)
- [JavaScript Scripting](#javascript-scripting)
- [Color design](#color-design)
  - [Color pairs](#color-pairs)
- [Widgets](#widgets)
  - [Widget design](#widget-design)
    - [Widget style](#widget-style)
    - [Icons](#icons)
    - [Text](#text)
- [Scripts](#scripts)
  - [Shaddow](#shaddow)
  - [openHAB Log InfluxDB](#openhab-log-influxdb)

***
## JavaScript Scripting

My JavaScript tools are at [openhab-js-tools](https://github.com/florian-h05/openhab-js-tools).
This npm module also provides numerous JavaScript rules, see [openhab-js-tools : JSDoc](https://florian-h05.github.io/openhab-js-tools/).

You may also have a look at [rkoshak/openhab-rules-tools](https://github.com/rkoshak/openhab-rules-tools).

To access the old NashornJS tools, head over to the [nashorn-js-libs branch](https://github.com/florian-h05/openhab-conf/tree/nashorn-js-libs).

To access the old NashornJS scrips, head over to the [nashorn-js-scripts branch](https://github.com/florian-h05/openhab-conf/tree/nashorn-js-scripts).

***
## Color design

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

### Color pairs

Which color pairs do I use for which color?
* Green: ```(themeOptions.dark === 'dark' ? '#76d275' : '#00701a')```
* Yellow: ```(themeOptions.dark === 'dark' ? '#ffff6b' : '#c5a600')```
* Orange: ```(themeOptions.dark === 'dark' ? '#ffbc45' : '#c25e00')```
* Red: ```(themeOptions.dark === 'dark' ? '#e53735' : '#ab000d')```

These color pairs are all from color series __600__.

***
## Widgets

My custom widget set for the openHAB 3 MainUI.
Feel free to use or modify [these widgets](/UI/widgets). Information for each widget can be found [here](/UI/widgets).

### Widget design


#### Widget style

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

#### Icons

Most icons are from [Framework7](https://framework7.io/icons/). 
Sometimes, openHAB icons are used, e.g. for state representation. 

_Framework7_ icons normally use these sizes:
* small icon (with small text, e.g. upper left corner): __18__
* standard icon (with standard text): __20__

_openHAB_ icons' size varies.

#### Text

Text style follows these guidelines:
* small text (e.g. upper left corner): ```font-size: 12px```
* standard text: ```font-size: 16px```
* header text: ```font-size: 17px``` & ```font-weight: 600```
* sub-header text: ```font-size: 12px```
* large text (for state representation, e.g. in widget contact): ```font-size: 24px``` & ```font-weight: 400```

***
## Scripts

Scripts for the _openhab-conf/scripts_ folder.

### Shaddow

This script was originally written by [@pmpkk](https://github.com/pmpkk) at [openhab-habpanel-theme-matrix](https://github.com/pmpkk/openhab-habpanel-theme-matrix).
I only modified it to work with _Python 3_ and the new _InfluxDB 2.x_. 

[shaddow.py](/scripts/shaddow.py) generates a _.svg_ image to illustrate where the sun is currently positioned, which site of the house is facing the sun and where the shaddow of your house is.
I added the position of the moon to the image. 

Please look at [this guide](/scripts/SHADDOW.md).

### openHAB Log InfluxDB

A log for your smart home with [openhab-log-influxdb.py](/scripts/openhab-log-influxdb.py).

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
