var errorMessages = require('../utils/error-messages.js');
var cache = require('../storage/cache.js');
var constants =  require('../utils/constants.js');

/**
 * output the streams options {data, value} array for this connection
 */
exports.options = function (req, res /*, next*/) {
  if (! req.pryvConnection) { return errorMessages.sendAuthentificationRequired(res); }

  var result = { data : [ {label: '[ANY STREAM]', value: constants.ANY_STREAMS }] };


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
    if (error) { return errorMessages.sendInternalError(res, 'Failed fetching streams'); }
    addStreams(0, streamsArray);
    res.json(result);
  });
};