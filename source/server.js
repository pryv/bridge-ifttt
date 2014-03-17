var config = require('./utils/config'),
    logger = require('winston'),
    version = require('../package.json').version;

var app = require('./app')(),
    server = require('http').createServer(app);

server.listen(config.get('http:port'), config.get('http:ip'), function () {
  var address = server.address();
  logger.info('IFTTT Bridge v' + version + ' in ' + app.settings.env + ' mode listening on:' +
      address.address + ':' + address.port);
}).on('error', function (e) {
  logger.error('Failed to listen on ' + config.get('http:ip') + ':' + config.get('http:port') +
      ': ' + e);
  throw new Error(e);
});

module.exports = server;
