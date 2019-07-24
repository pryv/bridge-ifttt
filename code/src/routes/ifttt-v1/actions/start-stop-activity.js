//var pryv = require('pryv');

var PYError = require('../../../errors/PYError.js');
var versionPath = '/ifttt/v1/';
var config = require('../../../utils/config.js');

// Draft
// - the lib-js to support / start / stop
// - stream list should display singleActivities indicators


module.exports = function setup(app) {
  var actionPath = versionPath + 'actions/start-stop-activity';

  app.post(actionPath + '/fields/streamId/options',
    require('../../../fields/stream').optionsStrict);

  app.post(actionPath, function (req, res, next) {
    if (! req.pryvConnection) { return next(PYError.authentificationRequired()); }

    if (! req.body.actionFields) {
      return next(PYError.contentError('Cannot find actionFields'));
    }

    var actionFields = req.body.actionFields;

    if (! actionFields.streamId) {
      return next(PYError.contentError('Cannot find actionFields.streamId'));
    }


    if (! actionFields.action || ['start', 'stop'].indexOf(actionFields.action) < 0) {
      return next(PYError.contentError('Cannot find (or invalid) actionFields.action'));
    }



    // --- streamId
    var streamId = actionFields.streamId; //TODO check it's valid
    var eventData = {
      streamId: streamId,
      type: 'activity/plain'
    };

    // --- description
    if (actionFields.description) { eventData.description = actionFields.description; }

    // --- tags
    if (actionFields.tags) {
      var tags = [];
      actionFields.tags.split(',').forEach(function (tag) {
        var limit = 500;
        var cleanTag = tag.trim();
        if(cleanTag.length>limit) {
          cleanTag = cleanTag.substring(0,limit);
        }
        tags.push(cleanTag);
      });
      if (tags.length > 0) {
        eventData.tags = tags;
      }
    }

    // -- to be continued

    var sendResponse = function (error, event) {
      if (error) {
        if (error instanceof PYError) {
          return next(error);
        }
        return next(PYError.internalError('Failed creating event '));
      }
      var data = {data: [ {id: event.id} ]};
      if (config.get('debug:newEventAction')) {
        console.log('OK creating event ', data);
      }
      res.json(data);
    };

    if (actionFields.action === 'start') {
      req.pryvConnection.events.start(eventData, sendResponse);
    } else {
      req.pryvConnection.events.stop(eventData, sendResponse);
    }
  });
};
