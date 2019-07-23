const PYError = require('../../../errors/PYError.js');
const constants = require('../../../utils/constants.js');
const cache = require('../../../storage/cache.js');
const logger = require('winston');
const versionPath = '/ifttt/v1/';
const config = require('../../../utils/config.js');

const request = require('superagent');

/**
 * Generic extraOption Handler
 * @param app
 * @param {String} optionKey slug for this option
 * @param {String} route 'new-note'
 * @param {Function} doFunction function(req, res, next)
 */
exports.addOption = function (app, optionKey, route, doFunction) {
  const optionPath = versionPath + 'triggers/' + route + '/fields/' + optionKey + '/options';
  app.post(optionPath, doFunction);
};


/**
 * Generic wrapper for simple event-type based Triggers
 * @param app
 * @param {String} route '/new-note'
 * @param {String | Function} dataType 'note/txt', if function it will return the required DataType
 * @param {Function} map function(event, eventData)
 */
exports.setup = function (app, route, dataType, mapFunction) {
  const triggerPath = versionPath + 'triggers/' + route;

  app.post(triggerPath + '/fields/streamId/options', require('../../../fields/stream').options);

  app.post(triggerPath, function (req, res, next) {
    
    if (! req.pryvConnection) { return next(PYError.authentificationRequired()); }
    const pyConn = req.pryvConnection;

    const body = req.body;

    //---- construct the filter

    const filterLike = {
      limit: 50
    };
    if (body.limit != null || body.limit === 0) {
      filterLike.limit = body.limit;
    }

    if (! body.triggerFields) {
      return next(PYError.contentError('No triggerFields'));
    }
    const triggerFields = body.triggerFields;

    if (typeof dataType === 'function') {

      filterLike.types = dataType(triggerFields);
      if (! filterLike.types) {
        return next(PYError.contentError('Cannot determine dataType (eventType)'));
      }
    } else {
      filterLike.types = [dataType];
    }

    if ( triggerFields.streamId == null ) {
      return next(PYError.contentError('No StreamId'));
    }

    if (triggerFields.streamId !== constants.ANY_STREAMS) {
      filterLike.streams = [triggerFields.streamId];
    }

    //-- skip
    if (filterLike.limit === 0) {
      console.log('limit === 0');
      return res.send({data : []});
    }

    // -- fetch the events
    request.get(pyConn.urlEndpoint + '/events')
      .set('Authorization', pyConn.auth)
      .query(filterLike)
      .end(function (error, response) {
        
        if (error) { 
          return next(PYError.internalError('Failed fetching events', error)); 
        }
  
        const eventsArray = response.body.events;

        // -- get the streamsMap for the names
        cache.getStreamsMap(req.pryvConnection, function (error, streamMap) {
          if (error != null) {
            return next(PYError.internalError('Failed fetching streams from cache', error));
          }

          const data = [];  // will be sent

          eventsArray.forEach(function (event) {

            if (filterLike.types.indexOf(event.type) < 0) {
              logger.error('trigger ' + route + ' get an event with type : ' + event.type);
            }  else {

              let streamId =  event.streamId;
              let streamName = '';
              if (streamMap[streamId] && streamMap[streamId].name) {
                streamName = streamMap[event.streamId].name;
              }

              const eventData = {
                meta: {id : event.id, timestamp: Math.round(event.time)},
                description : event.description || '',
                Tags: event.tags ? event.tags.join(', ') : null,
                StreamName: streamName,
                AtTime: (new Date(event.time * 1000)).toIFTTTISOString(),
              };

              // we need `urlEndpoint` from this in mapFunction()
              event.pyConn = pyConn;

              //-- add extra informations
              mapFunction(event, eventData, triggerFields);
              if (eventData.FileURL != null) {
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
