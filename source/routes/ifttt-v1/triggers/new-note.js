var errorMessages = require('../../../utils/error-messages.js');
var cache = require('../../../storage/cache.js');


var versionPath = '/ifttt/v1/';
var triggerPath = versionPath + 'triggers/new-note';

module.exports = function setup(app) {

  app.post(triggerPath + '/fields/stream/options',
    require('../../../fields/stream').options);

  app.post(triggerPath, function (req, res /*, next*/) {
    if (! req.pryvConnection) { return errorMessages.sendAuthentificationRequired(res); }

    var filterLike = {
      streams : [ req.body.triggerFields.stream],
      limit: req.body.limit || 50,
      types: ['note/txt']
    };

    req.pryvConnection.events.get(filterLike, function (error, eventsArray) {
      if (error) { return errorMessages.sendInternalError(res, 'Failed fetching events'); }

      cache.getStreamsMap(req.pryvConnection, function (error, streamMap) {




        var data = [];

        for (var i = 0, length = eventsArray.length; i < length; i++) {
          var event = eventsArray[i];


          var streamName =  event.streamId;
          if (streamMap[event.streamId] && streamMap[event.streamId].name) {
            streamName = streamMap[event.streamId].name;
          }

          if (event.type === 'note/txt')
          {
            data.push({
              ifttt: {id : event.id, timestamp: Math.round(event.time)},
              NoteContent : event.content,
              Tags: event.tags ? event.tags.join(', ') : null,
              StreamName: streamName,
              At: (new Date(event.time * 1000)).toISOString()
            });
          }
        }

        console.log(data);
        res.send({data : data});
      });
    });
  });
};

