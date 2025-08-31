/*
Copyright (c) 2024 Florian Hotze under MIT License

This script generates the JSON string for the weatherCard widget from OpenWeatherMap One Call API current weather and forecast data.
It depends on the Items defined in the openweathermap.items file in this repository.

Hosted at: https://github.com/florian-h05/openhab-conf
*/

const { items, rules, time } = require('openhab');

const PERSISTENCE = 'inmemory'; // Configure the ID of you persistence service here
const HOURS = 24; // the number of hours to generate the forecast JSON for - set this to the same number as in the widget
const DAYS = 3; // the number of days to generate the forecast JSON for - set this to the same number as in the widget

const PREFIX = "OneCall_";
const CURRENT = 'Current_';
const FORECAST = 'Forecast_'
const HOURLY = "Hourly_";
const DAILY = "Daily_";

/**
 * Calculates whether currently is day-time and adds the sunrise or sunset time if sunrise or sunset happens in the current hour.
 *
 * @param {object} json the JSON object to add the value to
 * */
function calculateCurrentDayData (json) {
  const sunrise = time.toZDT(items.getItem(PREFIX + CURRENT + 'Sunrise'));
  const sunset = time.toZDT(items.getItem(PREFIX + CURRENT + 'Sunset'));
  json.current.day = time.toZDT().isBetweenDateTimes(sunrise, sunset);

  const beginOfHour = time.toZDT().withMinute(0).withSecond(0).withNano(0);
  const endOfHour = beginOfHour.plusHours(1);
  if (time.toZDT(sunrise).isBetweenDateTimes(beginOfHour, endOfHour)) json.current.sunrise = sunrise.state;
  if (time.toZDT(sunset).isBetweenDateTimes(beginOfHour, endOfHour)) json.current.sunset = sunset.state;
}

/**
 * Adds the current value of the Item with name `PREFIX + CURRENT + field` as property `field.toLowerCase()` to the JSON object.
 *
 * @param {string} field
 * @param {object} json the JSON object to add the value to
 * @param {function(*): string} [formatter] the optional function to format the Item state
 */
function addCurrentValue (field, json, formatter = (state) => state) {
  json.current[field.toLowerCase()] = formatter(items.getItem(PREFIX + CURRENT + field).state).toString();
}

/**
 * Adds the hourly forecast values of the Item with name `PREFIX + FORECAST + HOURLY + field` as property `field.toLowerCase()` to the JSON object.
 * Calculates whether the forecasted hour is during day-time and if sunrise or sunset happens during the forecasted hour.
 *
 * @param {string} field
 * @param {object} json the JSON object to add the value to
 * @param {function(*): string} [formatter] the optional function to format the Item state
 * @param {number} [hours=HOURS] the number of hours to add the hourly forecast values for
 */
function addHourlyValues (field, json, formatter = (state) => state, hours = HOURS) {
  const endOfHour = time.toZDT().withMinute(0).withSecond(0).withNano(0).plusHours(1);

  items.getItem(PREFIX + FORECAST + HOURLY + field).persistence.getAllStatesBetween(endOfHour, endOfHour.plusHours(hours), PERSISTENCE).forEach((s, i) => {
    // Current hour is not included in the forecast
    if (typeof json.hourly[i ] !== 'object') {
      json.hourly[i] = {
        ts: s.timestamp.toOpenHabString()
      };
    }
    json.hourly[i][field.toLowerCase()] = formatter(s.state).toString();

    // Determine whether the forecasted hour is during day-time and if sunrise or sunset happens during the forecasted hour
    if (json.hourly[i].day === undefined) {
      const beginOfDay = s.timestamp.withHour(0).withMinute(0).withSecond(0).withNano(0);
      const endOfDay = beginOfDay.plusDays(1);
      const sunrise = items.getItem(PREFIX + FORECAST + DAILY + 'Sunrise').persistence.getAllStatesBetween(beginOfDay, endOfDay, PERSISTENCE)[0].state;
      const sunset = items.getItem(PREFIX + FORECAST + DAILY + 'Sunset').persistence.getAllStatesBetween(beginOfDay, endOfDay, PERSISTENCE)[0].state;
      const day = s.timestamp.isBetweenDateTimes(sunrise, sunset);
      json.hourly[i].day = day;

      const beginOfHour = s.timestamp.withMinute(0).withSecond(0).withNano(0);
      const endOfHour = beginOfHour.plusHours(1);
      if (time.toZDT(sunrise).isBetweenDateTimes(beginOfHour, endOfHour)) json.hourly[i].sunrise = sunrise;
      if (time.toZDT(sunset).isBetweenDateTimes(beginOfHour, endOfHour)) json.hourly[i].sunset = sunset;
    }
  });
}

/**
 * Adds the daily forecast values of the Item with name `PREFIX + FORECAST + DAILY + field` as property `field.toLowerCase()` to the JSON object.
 *
 * @param {string} field
 * @param {object} json the JSON object to add the value to
 * @param {function(*): string} [formatter] the optional function to format the Item state
 * @param {number} [days=DAYS + 1] the number of days to add the daily forecast values for
 */
function addDailyValues (field, json, formatter = (state) => state, days = DAYS + 1) {
  const beginOfDay = time.toZDT().withHour(0).withMinute(0).withSecond(0).withNano(0);
  items.getItem(PREFIX + FORECAST + DAILY + field).persistence.getAllStatesBetween(beginOfDay, beginOfDay.plusDays(days), PERSISTENCE).forEach((s, i) => {
    // Today is included in the forecast
    if (typeof json.daily[i] !== 'object') {
      json.daily[i] = {
        ts: s.timestamp.toOpenHabString()
      };
    }
    json.daily[i][field.toLowerCase()] = formatter(s.state).toString();
  });
}

/**
 * Gets the Framework7 icon name for the given OpenWeatherMap icon ID.
 *
 * @param {string} iconId an {@link https://openweathermap.org/weather-conditions#How-to-get-icon-URL OpenWeatherMap icon ID}
 * @return {string} the {@link https://framework7.io/icons/ Framework7 icon} name
 */
function getF7Icon (iconId) {
  return {
    '01d': 'sun_max_fill',
    '01n': 'moon_stars_fill',
    '02d': 'cloud_sun_fill',
    '02n': 'cloud_moon_fill',
    '03d': 'cloud_fill',
    '03n': 'cloud_fill',
    '04d': 'cloud_fill',
    '04n': 'cloud_fill',
    '09d': 'cloud_heavyrain_fill',
    '09n': 'cloud_heavyrain_fill',
    '10d': 'cloud_sun_rain_fill',
    '10n': 'cloud_moon_rain_fill',
    '11d': 'cloud_sun_bolt_fill',
    '11n': 'cloud_moon_bolt_fill',
    '13d': 'cloud_snow_fill',
    '13n': 'cloud_snow_fill',
    '50d': 'cloud_fog_fill',
    '50n': 'cloud_fog_fill' }[iconId]
}

/**
 * Creates a new temperature formatter function for the optionally specified decimals.
 *
 * @param {number} [decimals=0]
 * @return {function(*): string}
 */
function createTemperatureFormatter(decimals = 0) {
  return (state) =>  parseFloat(state).toFixed(decimals) + '°';
}

/**
 * Formats a precipitation probability state.
 *
 * @param {string} state
 * @return {string}
 */
function formatPrecipitationProbability (state) {
  return parseFloat(state).toFixed(0) + '%'
}

/**
 * Creates the JSON data for the {@link https://github.com/florian-h05/openhab-conf/blob/main/UI/widgets/florianh-widgetset/weatherForecast.yaml `weatherForecast`} widget from the OpenWeatherMap One Call API forecast.
 *
 * @return {string}
 */
function createJSON() {
  const json = {
    current: {
      ts: time.toZDT().toOpenHabString()
    },
    hourly: [],
    daily: []
  };

  calculateCurrentDayData(json);
  addCurrentValue('IconId', json, getF7Icon);
  addCurrentValue('Temperature', json, createTemperatureFormatter(1));
  addCurrentValue('ApparentTemperature', json, createTemperatureFormatter(0));
  addCurrentValue('Condition', json);
  addCurrentValue('Humidity', json, (state) => Number.parseFloat(state.split(' ')[0]).toFixed(0) + ' ' + state.split(' ')[1]);
  addCurrentValue('Windspeed', json, (state) => Number.parseFloat(state.split(' ')[0]).toFixed(0) + ' ' + state.split(' ')[1]);

  addHourlyValues('IconId', json, getF7Icon);
  addHourlyValues('Temperature', json, createTemperatureFormatter());
  addHourlyValues('PrecipitationProbability', json, formatPrecipitationProbability);

  addDailyValues('IconId', json, getF7Icon);
  addDailyValues('MinTemperature', json, createTemperatureFormatter());
  addDailyValues('MaxTemperature', json, createTemperatureFormatter());

  return JSON.stringify(json);
}

rules.when()
  .system().startLevel(100)
  .or().cron('0 0 * ? * * *')
  .or().item(PREFIX + CURRENT + 'Temperature').changed()
  .or().item(PREFIX + 'JSON').receivedCommand().to('REFRESH')
  .then(() => {
    items.getItem(PREFIX + 'JSON').postUpdate(createJSON());
  }).build('OpenWeatherMap One Call API Current Weather & Forecast JSON Generator', 'Creates the JSON string for the weatherCard widget.', ['florianh-widgetset'], 'owm-one-call-weather-forecast-json');
