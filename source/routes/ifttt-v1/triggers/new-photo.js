var errorMessages = require('../../../utils/error-messages.js');

var versionPath = '/ifttt/v1/';
var triggerPath = versionPath + 'triggers/new-photo';

module.exports = function setup(app) {

  app.post(triggerPath + '/fields/stream/options',
    require('../../../fields/stream').options);

  app.post(triggerPath, function (req, res /*, next*/) {
    if (! req.pryvConnection) { return errorMessages.sendAuthentificationRequired(res); }

    var filterLike = {
      streams : [ req.body.triggerFields.stream],
      limit: req.body.limit || 50,
      types: ['picture/attached']
    };

    req.pryvConnection.events.get(filterLike, function (error, eventsArray) {
      if (error) { return errorMessages.sendInternalError(res, 'Failed fetching events'); }

      var data = [];

      for (var i = 0, length = eventsArray.length; i < length; i++) {
        var event = eventsArray[i];

        if (event.type === 'picture/attached' && event.attachments && event.attachments.length > 0)
        {
          data.push({
            ifttt: {id : event.id, timestamp: Math.round(event.time)},
            ImageURL : event.attachmentUrl(event.attachments[0]),
            Tags: event.tags ? event.tags.join(', ') : null,
            StreamName: event.streamId, // TODO switch to name one we have stream caching
            At: (new Date(event.time * 1000)).toISOString()
          });
        }
      }

      console.log(data);
      res.send({data : data});
    });
  });
};

