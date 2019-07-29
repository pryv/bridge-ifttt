// @flow

const logger = require('winston');
const fs = require('fs');
const nconf = require('nconf');

module.exports = nconf;

nconf.argv()
  .env();

let configFile: ?string = null;

/// /3. A file located at ..
if (nconf.get('config') != null) {
  configFile = nconf.get('config');
}


if (configFile != null && fs.existsSync(configFile) != null) {
  configFile = fs.realpathSync(configFile);
  logger.info('using custom config file: ' + configFile);
} else {
  if (configFile != null) {
    logger.error('Cannot find custom config file: ' + configFile);
  }
}

if (configFile != null) {
  nconf.file({ file: configFile});
}

// Set default values
nconf.defaults({
  pryv: {
    domain: 'pryv.li',
    access: 'https://reg.pryv.li/access'
  },
  ifttt: {
    clientId: 'ifttt-all',
    secret: 'setInHeadsetConfig',
    channelApiKey: 'setInHeadsetConfig',
    bridgeUrl: 'http://localhost', // override to https://ifttt.pryv.me
    realtimeApiUrlEndpoint: 'https://realtime.ifttt.com/v1/notifications',
  },
  oauth: {
    secretPath: 'setElseWhere'
  },
  http: {
    port: '8080',
    ip: '0.0.0.0' // interface to bind,
  },
  redis: {
    port: 7379
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
