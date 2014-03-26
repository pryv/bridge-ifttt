var errorMessages = require('../../../utils/error-messages.js');
var versionPath = '/ifttt/v1/';
var pryv = require('pryv');
var config = require('../../../utils/config');

var triggerSlug = 'new-photo-in-stream';


module.exports = function setup(app) {

  app.post(versionPath + 'triggers/' + triggerSlug + '/fields/stream/options',
    function (req, res /*, next*/) {
      if (! req.pryvCredentials) { return errorMessages.sendAuthentificationRequired(res); }

      var connection = new pryv.Connection({
        username: req.pryvCredentials.username,
        auth: req.pryvCredentials.pryvToken,
        staging: config.get('pryv:staging')
      });

      var result = { data : [] };


      function addStreams(level, streamsArray) {
        if (! streamsArray) { return; }
        var pad = '';
        for (var i = 0; i <= level; i++) { pad += '&nbsp;'; }
        streamsArray.forEach(function (stream) {

          result.data.push({label: pad + stream.name, value: stream.id});
          addStreams(level + 1, stream.children);
        });
      }
      connection.streams.get(null, function (error, streamsArray) {
        if (error) { return errorMessages.sendInternalError(res, 'Failed fetching streams'); }
        addStreams(0, streamsArray);


        res.json(result);

      });



    });
};
