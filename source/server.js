var config = require('./utils/config'),
    logger = require('winston'),
    version = require('../package.json').version;

// send crashes to Airbrake service
if (config.get('airbrake:disable') !== true) {
  var airbrake = require('airbrake').createClient(config.get('airbrake:key'));
  airbrake.handleExceptions();
}

var ready = require('readyness');
ready.setLogger(logger.info);

var app = require('./app')(),
    server = require('http').createServer(app);

var appListening = ready.waitFor('IFTTT Bridge v' + version + ' in ' + app.settings.env +
  ' mode listening on:' + config.get('http:ip') + ':' + config.get('http:port'));


server.listen(config.get('http:port'), config.get('http:ip'), function () {
  appListening();
}).on('error', function (e) {
  logger.error('Failed to listen on ' + config.get('http:ip') + ':' + config.get('http:port') +
      ': ' + e);
  throw new Error(e);
});

module.exports = server;
