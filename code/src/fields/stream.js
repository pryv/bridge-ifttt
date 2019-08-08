// @flow

const errors = require('../errors/factory');
const cache = require('../storage/cache');
const constants =  require('../utils/constants');
const config = require('../utils/config');

import type { Stream, Credentials } from '../types';

/**
 * output the streams options {data, value} array for this connection
 * with a "ANY stream option"
 */
exports.options = function(req: express$Request, res: express$Response, next: express$NextFunction) {
  streams(req, res, next, true);
};

/**
 * output the streams options {data, value} array for this connection
 */
exports.optionsStrict = function (req: express$Request, res: express$Response, next: express$NextFunction) {
  streams(req, res, next, false);
};

function streams(req: express$Request, res: express$Response, next: express$NextFunction, all: boolean) {
  all = all || false;

  const pryvCredentials: Credentials = req.pryvCredentials;

  const result = { data : [ ] };
  if (all) {
    result.data.push({label: '[ANY STREAM]', value: constants.ANY_STREAMS });
  }

  function addStreams(level: number, streamsArray: Array<Stream>) {
    if (! streamsArray) { return; }
    let pad = '';
    for (let i = 0; i < level; i++) { pad += '.'; }
    streamsArray.forEach(function (stream) {
      result.data.push({label: pad + stream.name, value: stream.id});
      addStreams(level + 1, stream.children);
    });
  }

  cache.getStreams(pryvCredentials, function (error: ?Error, streamsArray: ?Array<Stream>): void {
    if (error != null) {
      return next(errors.internalError('Failed fetching streams', '', error));
    }
    addStreams(0, streamsArray);

    if (config.get('debug:logFieldsStreams') != null) {
      //console.log(result);
    }
    res.json(result);
  });
}