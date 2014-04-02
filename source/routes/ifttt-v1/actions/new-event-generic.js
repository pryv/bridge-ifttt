var PYError = require('../../../errors/PYError.js');
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

  app.post(triggerPath, function (req, res, next) {
    if (! req.pryvConnection) { return next(PYError.authentificationRequired()); }

    if (! req.body.actionFields) {
      return next(PYError.contentError('Cannot find actionFields'));
    }

    mapFunction(req.body);

    res.send(200);
  });
};

/*
 { actionFields:
 { description: 'Tweet by iftttpryv',
 contentText: 'hello Pryv\n\nhello Pryv\n\nâ iftttpryv (@iftttpryv) April 2
 , 2014\n\nApril 02, 2014 at 10:17AM',
 stream: 'chtg78vkk00070i43s3q2kosv',
 tags: 'IFTTT, Twitter' } } }
 */

