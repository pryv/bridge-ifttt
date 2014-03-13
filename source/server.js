var config = require('./utils/config');
var logger = require('winston');

var version = require('../package.json').version;

logger.info('started version :' + version);

var app = require('./app')();

var server = require('http').createServer(app);


server.listen(config.get('http:port'), config.get('http:ip'), function () {
  var address = server.address();
  logger.info('IFFT Bridge in ' + app.settings.env + 'mode listening on:' +
    address.address + ':' + address.port);

}).on('error', function (e) {
    logger.error('failed to listen: ' + config.get('http:ip') + ':' + config.get('http:port'));
    throw new Error(e);
  });


module.exports = server;