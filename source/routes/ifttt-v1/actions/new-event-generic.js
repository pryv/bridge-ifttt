var errorMessages = require('../../../utils/error-messages.js');
//var constants = require('../../../utils/constants.js');
//var cache = require('../../../storage/cache.js');

var versionPath = '/ifttt/v1/';

/**
 * Generic wrapper for simple event-type based Triggers
 * @param app
 * @param {String} route '/new-note'
 * @param {Function} map function(pryvConnection, responseBody)
 */
module.exports = function setup(app, route, mapFunction) {
  var triggerPath = versionPath + 'actions/' + route;

  app.post(triggerPath + '/fields/stream/options', require('../../../fields/stream').optionsStrict);

  app.post(triggerPath, function (req, res /*, next*/) {
    if (! req.pryvConnection) { return errorMessages.sendAuthentificationRequired(res); }

    mapFunction(req.body);

    res.send(200);
  });
};

