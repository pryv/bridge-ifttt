// Dependencies

var logger = require('winston');
var fs = require('fs');
var nconf = require('nconf');

// Exports

module.exports = nconf;


//Setup nconf to use (in-order): 
//1. Command-line arguments
//2. Environment variables

nconf.argv()
  .env();

var  configFile = null;

/// /3. A file located at ..
if (typeof(nconf.get('config')) !== 'undefined') {
  configFile = nconf.get('config');
}


if (fs.existsSync(configFile)) {
  configFile = fs.realpathSync(configFile);
  logger.info('using custom config file: ' + configFile);
} else {
  if (configFile) {
    logger.error('Cannot find custom config file: ' + configFile);
  }
}

if (configFile) {
  nconf.file({ file: configFile});
}

// Set default values
nconf.defaults({
  pryv: {
    domain : 'pryv.me',
    access : 'https://reg.pryv.me/access'
  },
  ifttt: {
    clientId: 'ifttt-all',
    secret: 'setInHeadsetConfig',
    channelApiKey: 'setInHeadsetConfig'
  },
  oauth: {
    secretPath: 'setElseWhere'
  },
  http: {
    port: '8080',
    ip: '0.0.0.0' // interface to bind,
  },
  redis: {
    port : 7379
  },
  debug: {
    shushPYInternalErrorLog: false,
    shushReqUrlLog: true,
    middlewareDebug: false,
    oauth: false,
    fieldsStreams: false,
    newEventTrigger: false,
    newEventAction: false
  },
  airbrake: {
    disable: true,
    key: 'changeme' // bridge-ifttt
  }
});

if (process.env.NODE_ENV === 'test') {
  nconf.set('http:port', '9443');
}
