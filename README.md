# openHAB configuration [@florian-h05](https://github.com/florian-h05)

### Parts of my openHAB 3 configuration.

***
## Table of Contents
* 1. [Color design](#1.-color-design)
  * 1.1 [Color pairs](#1.1-color-pairs)
* 2. [Widgets](#2.-widgets)
  * 2.1 [Widget design](#2.1-widget-design)
    * 2.1.1 [Widget style](#2.1.1-widget-style)
    * 2.1.2 [Icons](#2.1.2-icons)
    * 2.1.3 [Text](#2.1.3-text)

***
## 1. Color design

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
      name: invertText a
      required: false
      type: BOOLEAN
...
    # for background (in f7-card config):
      background-color: "=props.bgcolor ? (props.bgcolor_dark ? (themeOptions.dark === 'dark' ? props.bgcolor_dark : props.bgcolor) : props.bgcolor) : ''"
    # for text:
      color: "=props.invertText ? (props.invertText == true ? (themeOptions.dark === 'dark' ? 'black' : 'white') : '') : ''"
```

### 1.1 Color pairs

Which color pairs do I use for which color?
* Green: ```(themeOptions.dark === 'dark' ? '#76d275' : '#00701a')```
* Yellow: ```(themeOptions.dark === 'dark' ? '#ffff6b' : '#c5a600')```
* Orange: ```(themeOptions.dark === 'dark' ? '#ffbc45' : '#c25e00')```
* Red: ```(themeOptions.dark === 'dark' ? '#e53735' : '#ab000d')```

These color pairs are all from color series __600__.

***
## 2. Widgets

My custom widget set for the openHAB 3 MainUI.
Feel free to use or modify [these widgets](/UI/widgets). Information for each widget can be found [here](/UI/widgets).

### 2.1 Widget design


#### 2.1.1 Widget style

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

#### 2.1.2 Icons

Most icons are from [Framework7](https://framework7.io/icons/). 
Sometimes, openHAB icons are used, e.g. for state representation. 

_Framework7_ icons normally use these sizes:
* small icon (with small text, e.g. upper left corner): __18__
* standard icon (with standard text): __20__

_openHAB_ icons' size varies.

#### 2.1.3 Text

Text style follows these guidelines:
* small text (e.g. upper left corner): ```font-size: 12px```
* standard text: ```font-size: 16px```
* header text: ```font-size: 17px``` & ```font-weight: 600```
* sub-header text: ```font-size: 12px```
* large text (for state representation, e.g. in widget contact): ```font-size: 24px``` & ```font-weight: 400```
