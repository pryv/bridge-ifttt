// @flow

const request = require('superagent');
const db = require('./database.js');

import type { Stream, Credentials } from '../types';

/**
 * Get a map with stream by their Stream ID
 * @param pryvCredentials
 * @param callback
 */
function getStreamsMap(pryvCredentials: Credentials, callback: (err: ?Error, map: ?{}) => {}) {

  getStreams(pryvCredentials, function (error: ?Error, streamsArray: ?Array<Stream>) {
    if (error != null) { return callback(error, null); }

    const map = {};

    fillMap(streamsArray);
    callback(null, map);

    function fillMap(streamsArray) {
      if (streamsArray == null) { return; }
      streamsArray.forEach(function (stream: Stream) {
        map[stream.id] = stream;
        fillMap(stream.children);
      });
    }
  });
}
exports.getStreamsMap = getStreamsMap;

/**
 * "get Streams on connection and cache them"
 * @param pryvCredentials
 */
function getStreams(pryvCredentials: Credentials, callback: (err: ?Error, streams: ?Array<Stream>) => {}) {
  // -- check for cached streams on db

  const key: string = pryvCredentials.username + ':' + pryvCredentials.pryvToken + ':streams';

  db.getJSONCachedValue(key, function (error: ?Error, cachedStreams: ?Array<Stream>) {
    if (error != null) { return callback(error, null); }
    if (cachedStreams != null) { return callback(null, cachedStreams); }

    request.get(pryvCredentials.urlEndpoint + '/streams')
      .set('Authorization', pryvCredentials.pryvToken)
      .end(function (error, res) {

        if (error != null) {
          return callback(error, []);
        }

        const streamsArray = res.body.streams;

        if (streamsArray.length == 0) {
          return callback(null, []);
        }
        
        db.setJSONCachedValue(key, streamsArray,
          1 * 60, function () {
            callback(error, streamsArray);
          });
      });
  });
}
exports.getStreams = getStreams;
