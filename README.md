# openHAB configuration [@florian-h05](https://github.com/florian-h05)

## Table of Contents

- [Table of Contents](#table-of-contents)
- [JavaScript Scripting](#javascript-scripting)
- [Color design](#color-design)
  - [Color pairs](#color-pairs)
- [Widget Design](#widget-design)
  - [Widget Template](#widget-template)
  - [Widget Components](#widget-components)
- [Scripts](#scripts)
  - [Shaddow](#shaddow)
  - [Custom Loggers](#custom-loggers)

## JavaScript Scripting

My JavaScript tools are at [openhab-js-tools](https://github.com/florian-h05/openhab-js-tools).
This npm module also provides numerous JavaScript rules, see [openhab-js-tools : JSDoc](https://florian-h05.github.io/openhab-js-tools/).

You may also have a look at [rkoshak/openhab-rules-tools](https://github.com/rkoshak/openhab-rules-tools).

To access the old NashornJS tools, head over to the [nashorn-js-libs branch](https://github.com/florian-h05/openhab-conf/tree/nashorn-js-libs).

To access the old NashornJS scrips, head over to the [nashorn-js-scripts branch](https://github.com/florian-h05/openhab-conf/tree/nashorn-js-scripts).

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

- Green: ```(themeOptions.dark === 'dark' ? '#76d275' : '#00701a')```
- Yellow: ```(themeOptions.dark === 'dark' ? '#ffff6b' : '#c5a600')```
- Orange: ```(themeOptions.dark === 'dark' ? '#ffbc45' : '#c25e00')```
- Red: ```(themeOptions.dark === 'dark' ? '#e53735' : '#ab000d')```

These color pairs are all from color series __600__.

## Widget Design

My custom widget set for the openHAB 3 MainUI.
Feel free to use or modify [these widgets](/UI/widgets). Information for each widget can be found [here](/UI/widgets).

### Widget Template

Most of my custom widgets are based on this template:

```yaml
uid: mynewwidget
tags:
  - florianh-widgetset
props:
  parameters:
    - description: Small title on top of the card
      label: Title
      name: title
      required: false
      type: TEXT
      groupName: appearance
    - description: Header big sized
      label: Header
      name: header
      required: false
      type: TEXT
      groupName: appearance
    - description: Icon on top of the card (only f7 icons (without f7:)), e.g lightbulb, power or divide_circle
      label: Icon
      name: icon
      required: false
      type: TEXT
      groupName: appearance
    - description: word (e.g. ‚red‘), rgba or HEX
      label: Background Color
      name: bgcolor
      required: false
      type: TEXT
      groupName: appearance
  parameterGroups:
    - name: appearance
      label: Appearence settings
    - name: widgetAction
      context: action
      label: Action settings
      description: Action to perform when the widget is clicked
    - name: widgetSettings
      label: Widget settings
timestamp: Oct 2, 2022, 7:19:09 PM
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
  content:
    - component: f7-block
      config:
        style:
          display: flex
          flex-direction: row
          left: 16px
          position: absolute
          top: -5px
      slots:
        default:
          - component: f7-icon
            config:
              f7: "=props.icon ? props.icon : 'lightbulb'"
              size: 18
              style:
                margin-right: 10px
          - component: Label
            config:
              style:
                font-size: 12px
                margin-top: 0px
              text: "=props.title ? props.title : ''"
    - component: f7-block
      config:
        style:
          left: 17px
          position: absolute
          width: 100%
          top: 45px
      slots:
        default:
          - component: Label
            config:
              style:
                font-size: 24px
                font-weight: 400
                overflow: hidden
                text-overflow: ellipsis
                white-space: nowrap
                width: "=props.bigOhIcon ? 'calc(100% - 80px)' : '100%'"
              text: "=props.header ? props.header : 'Set header!'"
...
```

The _background-color_ attribute varies if the widget supports light and dark backgrounds. For more information have a look at [Color Design](#color-design).

The _height_ attribute usually varies between three sizes:

- __120px__ for normal-sized widgets
- __150px__ for large widgets with much content and controls
- __130px__ for the room card, which is not combined with other cards on one page

### Widget Components

#### Big openHAB icon

```yaml
...
    - description: Big icon shown in the upper right corner (hides the toggle)
      label: Big openHAB Icon
      name: bigOhIcon
      required: false
      type: TEXT
      groupName: appearance
...
    - component: oh-icon
      config:
        icon: =props.bigOhIcon
        style:
          position: absolute
          right: 15px
          top: 15px
          width: 80px
        visible: "=props.bigOhIcon ? true : false"
...
```

#### Icons

Most icons are from [Framework7](https://framework7.io/icons/).
Sometimes, openHAB icons are used, e.g. for state representation.

_Framework7_ icons normally use these sizes:

- small icon (with small text, e.g. upper left corner): __18__
- standard icon (with standard text): __20__

_openHAB_ icons' size varies.

#### Text

Text size and weight follows these guidelines:

- small text (e.g. upper left corner): ```font-size: 12px```
- standard text: no extra settings
- small title (used at the top of the card): ```font-size: 12px```
- header text (used at card heading, state representation etc.): ```font-size: 24px``` & ```font-weight: 400```

Line wrap and overflow are usually configured with the following attributes:

- `overflow: hidden`
- `text-overflow: ellipsis`
- `white-space: nowrap`

## Scripts

Scripts for the _openhab-conf/scripts_ folder.

### Shaddow

This script was originally written by [@pmpkk](https://github.com/pmpkk) at [openhab-habpanel-theme-matrix](https://github.com/pmpkk/openhab-habpanel-theme-matrix).
I only modified it to work with _Python 3_ and the new _InfluxDB 2.x_.

[shaddow.py](/scripts/shaddow.py) generates a _.svg_ image to illustrate where the sun is currently positioned, which site of the house is facing the sun and where the shaddow of your house is.
I added the position of the moon to the image.

Please look at [this guide](/scripts/SHADDOW.md).

### Custom Loggers

openHAB is using [log4j2](https://logging.apache.org/log4j/2.x/) as logger library, which allows the user to add custom loggers for writing into separate log files.

To enable a custom logger, you have to add something like the following example to _$openhab-userdata/etc/log4j2.xml_:

To the `Appenders` section:

```xml
		<!— KNX appender (custom) —>
		<RollingFile fileName="${sys:openhab.logdir}/knx.log" filePattern="${sys:openhab.logdir}/knx.log.%i.gz" name="KNX">
			<PatternLayout pattern="%d{yyyy-MM-dd HH:mm:ss.SSS} [%-5.5p] [%-36.36c] - %m%n"/>
			<Policies>
				<SizeBasedTriggeringPolicy size="16 MB"/>
			</Policies>
			<DefaultRolloverStrategy max="7"/>
		</RollingFile>
```

To the `Loggers` section:

```xml
		<!— Custom loggers —>
		<!— KNX logger —>
		<Logger additivity="false" level="DEBUG" name="org.openhab.logging.knx">
			<AppenderRef ref="KNX"/>
		</Logger>
```

To use this custom logger in JS Scripting, set the according logger name, e.g.:

```javascript
// @ts-ignore
console.loggerName = 'org.openhab.logging.knx';
```
