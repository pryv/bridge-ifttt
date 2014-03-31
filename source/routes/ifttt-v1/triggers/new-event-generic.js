var errorMessages = require('../../../utils/error-messages.js');
var cache = require('../../../storage/cache.js');


var versionPath = '/ifttt/v1/';



/**
 * Generic wrapper for simple event-type based Triggers
 * @param app
 * @param {String} route '/new-note'
 * @param {String} dataType 'note/txt'
 * @param {Function} map function(event, eventData)
 */
module.exports = function setup(app, route, dataType, mapFunction) {
  var triggerPath = versionPath + 'triggers/' + route;

  app.post(triggerPath + '/fields/stream/options', require('../../../fields/stream').options);

  app.post(triggerPath, function (req, res /*, next*/) {
    if (! req.pryvConnection) { return errorMessages.sendAuthentificationRequired(res); }

    var filterLike = {
      streams : [req.body.triggerFields.stream],
      limit: req.body.limit || 50,
      types: [dataType]
    };

    // -- fetch the events
    req.pryvConnection.events.get(filterLike, function (error, eventsArray) {
      if (error) { return errorMessages.sendInternalError(res, 'Failed fetching events'); }

      // -- get the streamsMap for the names
      cache.getStreamsMap(req.pryvConnection, function (error, streamMap) {

        var data = [];  // will be sent

        eventsArray.forEach(function (event) {

          var streamName =  event.streamId;
          if (streamMap[event.streamId] && streamMap[event.streamId].name) {
            streamName = streamMap[event.streamId].name;
          }

          var eventData = {
            ifttt: {id : event.id, timestamp: Math.round(event.time)},
            Tags: event.tags ? event.tags.join(', ') : null,
            StreamName: streamName,
            At: (new Date(event.time * 1000)).toISOString()
          };

          mapFunction(event, eventData); //-- add extra informations
          data.push(eventData);
        });

        console.log(data);
        res.send({data : data});
      });
    });
  });
};

