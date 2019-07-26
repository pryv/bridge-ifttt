// @flow

const request = require('superagent');
const db = require('./database.js');

import type { Stream, PryvConnection } from '../types';

/**
 * Get a map with stream by their Stream ID
 * @param pryvConnection
 * @param callback
 */
function getStreamsMap(pryvConnection: PryvConnection, callback: (err: ?Error, map: ?{}) => {}) {

  getStreams(pryvConnection, function (error: ?Error, streamsArray: ?Array<Stream>) {
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
 * @param pryvConnection
 */
function getStreams(pryvConnection: PryvConnection, callback: (err: ?Error, streams: ?Array<Stream>) => {}) {
  // -- check for cached streams on db

  const pyConn: PryvConnection = pryvConnection;

  const key: string = pyConn.username + ':' + pyConn.auth + ':streams';

  db.getJSONCachedValue(key, function (error: ?Error, cachedStreams: ?Array<Stream>) {
    if (error != null) { return callback(error, null); }
    if (cachedStreams != null) { return callback(null, cachedStreams); }

    request.get(pyConn.urlEndpoint + '/streams')
      .set('Authorization', pyConn.auth)
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
