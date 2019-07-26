// @flow

const config = require('./utils/config');
const logger = require('winston');
const version = require('../../package.json').version;

// send crashes to Airbrake service
if (config.get('airbrake:disable') !== true) {
  const airbrake = require('airbrake').createClient(config.get('airbrake:key'));
  airbrake.handleExceptions();
}

const ready = require('readyness');
ready.setLogger(logger.info);

const app: express$Application = require('./app')();
const server = require('http').createServer(app);

const appListening = ready.waitFor('IFTTT Bridge v' + version + ' in ' + app.settings.env +
  ' mode listening on:' + config.get('http:ip') + ':' + config.get('http:port'));


server.listen(config.get('http:port'), config.get('http:ip'), function () {
  appListening();
}).on('error', function (e) {
  logger.error('Failed to listen on ' + config.get('http:ip') + ':' + config.get('http:port') +
      ': ' + e);
  throw new Error(e);
});

module.exports = server;
