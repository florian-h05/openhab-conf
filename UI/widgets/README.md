# openHAB MainUI widgets

You can add the widgets by opening `Developer Tools` > `Widgets`, clicking on the plus and pasting the content of the respective yaml file.

Please keep in mind that some parts of the widgets are „hardcoded“ in German, but this can be changed easily!

Most widgets allow to perform an on-click action, but usually the action config is only displayed when __advanced__ is ticked.

## Widget [`amplifier`](./amplifier.yaml)

This widget provides power, mute, volume and input control, as well as playback information and playback control for an amplifier.

![](./images/amplifier/control_dark.jpeg)
![](./images/amplifier/playback_dark.jpeg)

### Configuration

Configuration is self-explaining.
For amplifiers using the Yamaha AV Receiver binding, you need to enable legacy playback control!

### Item Naming Scheme

The amplifiers Items must follow a given scheme.
The scheme applies to the base Item name:

- `_Power` (Switch Item)
- `_Mute` (Switch Item) (optional)
- `_Volume` (Dimmer or Number Item) (optional)
- `_Input` (String Item) (optional)
- `_Playback` (Player Item or String Item for legacy Yamaha AV -> Legacy playback control mode must be enabled) (optional)
  - `_Song` (String Item)
  - `_Album` (String Item)
  - `_Artist` (String Item)

## Widget [`contact`](./contact.yaml)

This widget represents the state of a contact with a configurable openHAB icon and a textual state representation.
The textual state representation changes the color based on the contact‘s state.

![](./images/contact/dark.jpeg)

### Configuration

Configuration is straight forward and requires no further explanation.

## Widget [`control`](./control.yaml)

This is probably the most universal widget in this collection, as it provides multiple ways of controlling an Item as well as state representation for groups and on-click actions.

### Control configuration

Configure the Item with the `item` param.

The following ways of controlling that Item are available:

- toggle (default): Displays a simple toggle (on/off) in the upper right corner.
- slider: Displays a slider at the bottom.
  Enabled with the `sliderEnable` param.
- selector (advanced): Displays a selector at the bottom which opens a popup with multiple options on click.
  Enabled with the `selectorEnable` param (advanced), hides both toggle and slider.
  Options can be configured in `value=label` syntax with the `action_config` param (advanced), leave empty to use default Item configuration.

### Style configuration

The default style configuration applies here as well.

### State configuration

This widget is able to display how many Items of a group are switched on.
For this feature, the widget relies on external logic (like a rule that counts the number of group members ON and saves that number to an Item).

Enable this „x of y are on“ feature with thia configuration steps:

1. Set the `header` prop.
2. Set the `item` prop to the group Item.
3. Set the `item_counter` prop to the Item that holds the number of group members ON.
4. Set the `items_total` prop the the total number of group members.

Together with this feature, you might want to have a popup to control the whole group?
No problem, the widget got you covered.

## Widget [`doorbellPageWidget`](./doorbellPageWidget.yaml)

A very special widget to provide a full-page video doorbell UI with automatic optimization for different screen sizes and screen rotations.

Most importantly, it displays the live video, provides a speech connection to the doorbell, and is able to open the door.

![Landscape mode](./images/doorbellPageWidget/dark_landscape.jpeg)
![Portrait/mobile mode](./images/doorbellPageWidget/dark_iphone.jpeg)

Depending on the screen orientation, the control elements are either displayed in an vertical arrangement on or besides the upper left of the live view, or displayed in a horizonal arrangement at the bottom of the screen.

### Control Elements

At the top or at the left of the control elements, are the doorbell pressed (bell icon) and motion (arrows icon) indicators are located.
A click on the bell icon opens a popup of the [`doorbellEvent` widget](./doorbellEvent.yaml) displaying the image and the timestamp the last time the doorbell was pressed.
A click on the motion indicator (arrows icon) does the same for the last motion event.

![Motion popup](./images/doorbellPageWidget/dark_landscape_motion.jpeg)

Next to the status, three control buttons follow:

- One to enable night vision or lights (e.g. infrared lights of DoorBird video doorbells).
- Another to talk to the person ringing at your door, using the [`oh-sipclient`](https://openhab.org/docs/ui/components/oh-sipclient.html) component.
  This component allows the MainUI to act as a SIP Client (SIP over WebSocket/WebRTC, which is not supported by all routers — for Fritz!Box, see [webrtc-sip-gw](https://github.com/florian-h05/webrtc-sip-gw)).
- And the last one, which is a lock opened icon, to open the door (usually by energizing a relay).

### Configuration

This widget depends on the [`doorbellEvent` widget](./doorbellEvent.yaml), so add this one as well!

Create a new layout page, add a block, then add a row, next add a column.
Open the column options and set it's width to 100%.
Finally, choose `doorbellPageWidget` from the personal widgets.

Configuration of the widget itself is self-explaining.

## Widget [`label`](./label.yaml)

Display any Item‘s state or just a simple text.
For numeric Items, you can display a trendline and open an analyzer.
If any action is enabled, the analyzer will open on a left-side click and the action on a right-side click.

![](./images/label/dark.jpeg)

### Configuration

Configuration is straight forward and requires no further explanation.

## Widget [`roomCard`](./roomCard.yaml)

The room card widget provides a quick overview for many states in one room and is fully configurable.
You can use a background image and you may use a header.
Color scheme and opacity is fully configurable for the columns.

![](./images/roomCard/complete.png)
![](./images/roomCard/reduced.png)

Note that this widget requires the [`mygaragedoor`](/icons/classic) icons for the garagedoor state.

### Data displayed

The widget can display up to three columns of data, each data field can and has to be configured:
- Humidity and illumination
- Current temperature, target temperature (in braces), heating & cooling state
- Lights state (on/off + number of lights on), windows/doors (for each open/closed + number of open), one or two blinds position, speaker state

### Configuration

Configuration is self-explaining.

## Widget [`shutter`](./shutter.yaml)

Control a shutter with buttons and optional slider, display the shutter’s position and the state of the automatic shading.

![](./images/shutter/dark.jpeg)

### Configuration

Configuration is straight forward and requires no further explanation.

## Widget [`solar`](./solar.yaml)

Display current power and today’s as well as total production and last refresh of solar inverter.

![](./images/solar/dark.jpeg)

### Items

- `pv_Power`: Current power of solar inverter.
- `pv_EToday`: Today‘s energy production
- `pv_ETotal`: Total energy production
- `pv_lastRefresh`: Last refresh of data from inverter (optional)

### Configuration

Configuration is self-explaining.

## Widget [`temperatureControl`](./temperatureControl.yaml)

Shows current temperature with analyzer, heating/cooling state and controls target temperature.

![](./images/temperatureControl/dark.jpeg)

### Configuration

Configuration is straight forward and requires no further explanation.
If the on-click action is enabled, the action will be available at the left half and the analyzer at the right half of the widget.

## Widget [`trigger`](./trigger.yaml)

Send one command to an Item on click, e.g. for calling scenes.
Bring some color to your MainUI pages with different background colors for light- and darkmode.

![](./images/trigger/light.jpeg)
![](./images/trigger/dark.jpeg)

### Configuration

Configuration is self-explaining.
For the color, I recommend to read my [Color design guideline](/README.md#color-design).
