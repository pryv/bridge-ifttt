var errorMessages = require('../../../utils/error-messages.js');
var versionPath = '/ifttt/v1';

var triggerSlug = 'new-photo-in-stream';


module.exports = function setup(app) {

  app.get(versionPath + '/triggers/' + triggerSlug + '/fields/stream/options',
    function (req, res /*, next*/) {
    if (! req.credentials) { return errorMessages.sendAuthentificationRequired(res); }
    var result = { data : [] };

    res.json(result);
  });
};
