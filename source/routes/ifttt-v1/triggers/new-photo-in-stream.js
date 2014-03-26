var errorMessages = require('../../../utils/error-messages.js');

var versionPath = '/ifttt/v1/';
var triggerPath = versionPath + 'triggers/new-photo-in-stream';

//var debug = require('../../../utils/debug.js');

module.exports = function setup(app) {

  app.post(triggerPath + '/fields/stream/options',
    require('../../../fields/stream').options);

  app.post(triggerPath, function (req, res /*, next*/) {
    if (! req.pryvConnection) { return errorMessages.sendAuthentificationRequired(res); }


    var limit = req.body.limit || 50;

    var modifiedSince =  Number.MIN_VALUE; // TODO set with last fetched events from db

    var filterLike = {
      streams : [ req.body.triggerFields.stream],
      modifiedSince: modifiedSince,
      fromTime: Number.MIN_VALUE
    };

    var lastFoundEvent = modifiedSince;

    req.pryvConnection.events.get(filterLike, function (error, eventsArray) {
      if (error) { return errorMessages.sendInternalError(res, 'Failed fetching events'); }

      var data = [];

      for (var i = 0, length = eventsArray.length; i < length; i++) {
        if (data.length >= limit) { break; }
        var event = eventsArray[i];

        if (event.type === 'picture/attached' && event.attachments && event.attachments.length > 0)
        {
          lastFoundEvent = event.modifiedSince;
          data.push({
            ifttt: {id : event.id, timestamp: Math.round(event.time)}, //TODO can we keep microsecs
            ImageURL : event.attachmentUrl(event.attachments[0]),
            Tags: event.tags ? event.tags.join(', ') : null,
            StreamName: event.streamId, // TODO switch to name one we have stream chaching
            At: (new Date(event.time * 1000)).toISOString()
          });
        }
      }

      // TODO save lastFoundEvent into modifiedSince for this request for future usage
      res.send({data : data});

    });

  });
};

