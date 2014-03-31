var db = require('./database.js');

/**
 * Get a map with stream by their StreamName
 * @param pryvConnection
 * @param callback
 */
function getStreamsMap(pryvConnection, callback) {

  getStreams(pryvConnection, function (error, streamsArray) {
    if (error) { return callback(error, null); }

    var map = {};
    function fillMap(streamsArray) {
      if (! streamsArray) { return; }
      streamsArray.forEach(function (stream) {
        map[stream.id] = stream;
        fillMap(stream.children);
      });
    }


    fillMap(streamsArray);
    callback(null, map);
  });
}
exports.getStreamsMap = getStreamsMap;

/**
 * "get Streams on connection and cache them"
 * @param pryvConnection
 */
function getStreams(pryvConnection, callback) {
  // -- check for cached streams on db

  var key = pryvConnection.username + ':' + pryvConnection.auth + ':streams';

  db.getJSONCachedValue(key, function (error, cachedStreams) {
    if (error) { return callback(error, null); }
    if (cachedStreams) { return callback(null, cachedStreams); }
    pryvConnection.streams.get(null, function (error, streamsArray) {
      if (! error && streamsArray && streamsArray.length > 0) {
        db.setJSONCachedValue(key, pryvConnection.streams.toJSON(streamsArray),
          300 * 1000, function () {
            callback(error, streamsArray);
          });
      }
    });
  });


}
exports.getStreams = getStreams;
