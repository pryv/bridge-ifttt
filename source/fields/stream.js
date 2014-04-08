var PYError = require('../errors/PYError.js');
var cache = require('../storage/cache.js');
var constants =  require('../utils/constants.js');

/**
 * output the streams options {data, value} array for this connection
 * with a "ANY stream option"
 */
exports.options = function (req, res, next) {
  streams(req, res, next, true);
};

/**
 * output the streams options {data, value} array for this connection
 */
exports.optionsStrict = function (req, res, next) {
  streams(req, res, next, false);
};

function streams(req, res, next, all) {
  all = all || false;

  if (! req.pryvConnection) { return next(PYError.authentificationRequired()); }

  var result = { data : [ ] };
  if (all) {
    result.data.push({label: '[ANY STREAM]', value: constants.ANY_STREAMS });
  }

  function addStreams(level, streamsArray) {
    if (! streamsArray) { return; }
    var pad = '';
    for (var i = 0; i < level; i++) { pad += ' '; }
    streamsArray.forEach(function (stream) {
      result.data.push({label: pad + stream.name, value: stream.id});
      addStreams(level + 1, stream.children);
    });
  }

  cache.getStreams(req.pryvConnection, function (error, streamsArray) {
    if (error) { return next(PYError.internalError('Failed fetching streams')); }
    addStreams(0, streamsArray);

    console.log(result);
    res.json(result);
  });
}