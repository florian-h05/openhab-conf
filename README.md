# openHAB configuration [@florian-h05](https://github.com/florian-h05)

## Table of Contents

- [Table of Contents](#table-of-contents)
- [JavaScript Scripting](#javascript-scripting)
- [Widgets](#widgets)
- [Scripts](#scripts)
  - [Shaddow](#shaddow)
  - [Custom Loggers](#custom-loggers)

## JavaScript Scripting

The majority of my openHAB automation is written in JavaScript, and I have a npm library that provides some useful functions and rules:
[florian-h05/openhab-js-tools](https://github.com/florian-h05/openhab-js-tools).

I can also recommend having a look at [rkoshak/openhab-rules-tools](https://github.com/rkoshak/openhab-rules-tools).

## Widgets

My custom widget-set for the openHAB MainUI (introduced with the 3.0 Release).
Feel free to use and/or modify [my widgets](/UI/widgets), just keep a copyright notice.

Please note that those widgets are written only tested on the current openHAB release version,
but since no breaking changes were made to the widget system, most of them should work with openHAB 3.4 or newer.
If they don't work, they most likely use new functionality that is not available on older openHAB versions.


For detailed guidelines on widget design principles, layouts, typography, colors, and ready-to-use components, please refer to [DESIGN.md](UI/widgets/florianh-widgetset/DESIGN.md).


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

You can create a custom logger by using the following scheme in _$openhab-userdata/etc/log4j2.xml_:

In the `Appenders` section:

```xml
		<!-- KNX appender (custom) -->
		<RollingFile fileName="${sys:openhab.logdir}/knx.log" filePattern="${sys:openhab.logdir}/knx.log.%i.gz" name="KNX">
			<PatternLayout pattern="%d{yyyy-MM-dd HH:mm:ss.SSS} [%-5.5p] [%-36.36c] - %m%n"/>
			<Policies>
				<SizeBasedTriggeringPolicy size="16 MB"/>
			</Policies>
			<DefaultRolloverStrategy max="7"/>
		</RollingFile>
```

In the `Loggers` section:

```xml
		<!-- Custom loggers -->
		<!-- KNX logger -->
		<Logger additivity="false" level="DEBUG" name="org.openhab.logging.knx">
			<AppenderRef ref="KNX"/>
		</Logger>
```

Because of an issue in Apache Karaf, make sure that the last logger is a `<Logger ...>`.
This means, you should not add your custom loggers to the end of the `Loggers` section, but rather to the beginning.
For more details see the corresponding [openHAB Core issue](https://github.com/openhab/openhab-core/issues/3818#issuecomment-1752504240).

To use this custom logger in JS Scripting, set the according logger name, e.g.:

```javascript
// @ts-ignore
console.loggerName = 'org.openhab.logging.knx';
```
