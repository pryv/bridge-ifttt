var PYError = require('../../../errors/PYError.js');
var constants = require('../../../utils/constants.js');
var cache = require('../../../storage/cache.js');
var logger = require('winston');
var versionPath = '/ifttt/v1/';
var config = require('../../../utils/config.js');

/**
 * Generic extraOption Handler
 * @param app
 * @param {String} optionKey slug for this option
 * @param {String} route 'new-note'
 * @param {Function} doFunction function(req, res, next)
 */
exports.addOption = function (app, optionKey, route, doFunction) {
  var optionPath = versionPath + 'triggers/' + route + '/fields/' + optionKey + '/options';
  console.log(optionPath);
  app.post(optionPath, doFunction);
};


/**
 * Generic wrapper for simple event-type based Triggers
 * @param app
 * @param {String} route '/new-note'
 * @param {String | Function} dataType 'note/txt', if function it will return the required DataType
 * @param {Function} map function(event, eventData)
 */
exports.setup = function setup(app, route, dataType, mapFunction) {
  var triggerPath = versionPath + 'triggers/' + route;

  app.post(triggerPath + '/fields/streamId/options', require('../../../fields/stream').options);

  app.post(triggerPath, function (req, res, next) {
    if (! req.pryvConnection) { return next(PYError.authentificationRequired()); }


    //---- construct the filter

    var filterLike = {
      limit: 50
    };
    if (req.body.limit || req.body.limit === 0) {
      filterLike.limit = req.body.limit;
    }


    if (! req.body.triggerFields) {
      return next(PYError.contentError('No triggerFields'));
    }

    if (typeof dataType === 'function') {

      filterLike.types = dataType(req.body.triggerFields);
      if (! filterLike.types) {
        return next(PYError.contentError('Cannot determine dataType (eventType)'));
      }
    } else {
      filterLike.types = [dataType];
    }


    if (! req.body.triggerFields.streamId) {
      return next(PYError.contentError('No StreamId'));
    }


    if (req.body.triggerFields.streamId !== constants.ANY_STREAMS) {
      filterLike.streams = [req.body.triggerFields.streamId];
    }

    //-- skip
    if (filterLike.limit === 0) {
      console.log('limit === 0');
      res.send({data : []});
    }


    // -- fetch the events
    req.pryvConnection.events.get(filterLike, function (error, eventsArray) {
      if (error) { return next(PYError.internalError('Failed fetching events', error)); }

      // -- get the streamsMap for the names
      cache.getStreamsMap(req.pryvConnection, function (error, streamMap) {

        var data = [];  // will be sent

        eventsArray.forEach(function (event) {

          if (filterLike.types.indexOf(event.type) < 0) {
            logger.error('trigger ' + route + ' get an event with type : ' + event.type);
          }  else {

            var streamName =  event.streamId;
            if (streamMap[event.streamId] && streamMap[event.streamId].name) {
              streamName = streamMap[event.streamId].name;
            }

            var eventData = {
              meta: {id : event.id, timestamp: Math.round(event.time)},
              description : event.description || '',
              Tags: event.tags ? event.tags.join(', ') : null,
              StreamName: streamName,
              AtTime: (new Date(event.time * 1000)).toIFTTTISOString()
            };

            //-- add extra informations
            if (mapFunction(event, eventData, req.body.triggerFields)) {
              data.push(eventData);
            }
          }
        });
        if (config.get('debug:newEventTrigger')) {
          console.log(data);
        }
        res.send({data : data});
      });
    });
  });
};

function pad(number) {
  if (number < 10) {
    return '0' + number;
  }
  return number;
}

Date.prototype.toIFTTTISOString = function () {
  return this.getUTCFullYear() +
    '-' + pad(this.getUTCMonth() + 1) +
    '-' + pad(this.getUTCDate()) +
    'T' + pad(this.getUTCHours()) +
    ':' + pad(this.getUTCMinutes()) +
    ':' + pad(this.getUTCSeconds()) +
    'Z';
};
