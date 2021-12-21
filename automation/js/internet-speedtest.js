/*
Copyright (c) 2021 Florian Hotze under MIT License
*/

const { rules, triggers, items, time, actions } = require('openhab');
const logger = require('openhab').log('internet-speedtest-JS');

rules.JSRule({
  name: 'Internet speedtest',
  description: 'Using Ookla\' speedtest cli',
  triggers: [
    triggers.ItemCommandTrigger('SpeedtestRerun', 'ON'),
    triggers.GenericCronTrigger('0 0/15 * * * ? *')
  ],
  execute: data => {
    logger.info('Starting speedtest.');
    items.getItem('SpeedtestRunning').postUpdate('Messung läuft ...');
    const output = actions.Exec.executeCommandLine(time.Duration.ofSeconds(40), '/bin/speedtest', '--accept-license', '--accept-gdpr');
    // Split by newline
    const response = output.split(/\r?\n/);
    let ping;
    let down;
    let up;
    // Simple error checking.
    if (output.search('Speedtest') !== -1) {
      items.getItem('SpeedtestResultDate').postUpdate(time.ZonedDateTime.now().withFixedOffsetZone().toString());
      logger.info('Starte Datenauswertung.');
      items.getItem('SpeedtestRunning').postUpdate('Datenauswertung läuft ...');
      // check for the given keywords
      for (let i = 0; i < response.length; i++) {
        // Get latency/ping
        if (response[i].search('Latency:') !== -1) {
          ping = parseFloat(response[i].split(/:| ms/)[1]);
        }
        // Get download
        if (response[i].search('Download:') !== -1) {
          down = parseFloat(response[i].split(/:| Mbps/)[1]);
        }
        // Get upload
        if (response[i].search('Upload') !== -1) {
          up = parseFloat(response[i].split(/:| Mbps/)[1]);
        }
      }
      // post numbers to openHAB items
      items.getItem('SpeedtestResultPing').postUpdate(ping);
      items.getItem('SpeedtestResultDown').postUpdate(down);
      items.getItem('SpeedtestResultUp').postUpdate(up);
      const summary = 'ᐁ ' + down.toFixed(1) + ' Mbit/s  ᐃ ' + up.toFixed(1) + ' Mbit/s (' + ping.toFixed(0) + ' ms)';
      items.getItem('SpeedtestSummary').postUpdate(summary.replaceAll('.', ','));
      items.getItem('SpeedtestRunning').postUpdate('-');
      logger.info('Speedtest finished.');
    } else {
      logger.error('Speedtest failed.');
      items.getItem('SpeedtestRunning').postUpdate('Letzte Ausführung fehlgeschlagen!');
    }
    items.getItem('SpeedtestRerun').postUpdate('OFF');
  },
  id: 'internet-speedtest'
});

logger.info('Script loaded.');
