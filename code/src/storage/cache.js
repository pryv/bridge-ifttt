const request = require('superagent');
const db = require('./database.js');

/**
 * Get a map with stream by their Stream ID
 * @param pryvConnection
 * @param callback
 */
function getStreamsMap(pryvConnection, callback) {

  getStreams(pryvConnection, function (error, streamsArray) {
    if (error) { return callback(error, null); }

    const map = {};

    fillMap(streamsArray);
    callback(null, map);

    function fillMap(streamsArray) {
      if (streamsArray == null) { return; }
      streamsArray.forEach(function (stream) {
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
function getStreams(pryvConnection, callback) {
  // -- check for cached streams on db

  const pyConn = pryvConnection;

  const key = pyConn.username + ':' + pyConn.auth + ':streams';

  db.getJSONCachedValue(key, function (error, cachedStreams) {
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
