# openHAB configuration [@florian-h05](https://github.com/florian-h05)

### Parts of my openHAB 3 configuration.

***
## Table of Contents
1. [Design guidelines](#design-guidelines)
2. [Widgets](#widgets)

***
## Design guidelines

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