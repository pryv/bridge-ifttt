// @flow

const errors = require('../../../errors/factory');
const constants = require('../../../utils/constants');
const cache = require('../../../storage/cache');
const logger = require('winston');
const versionPath = '/ifttt/v1/';
const config = require('../../../utils/config');

const request = require('superagent');

import type { Credentials } from '../../../types';

/**
 * Generic extraOption Handler
 * @param app
 * @param {String} optionKey slug for this option
 * @param {String} route 'new-note'
 * @param {Function} doFunction function(req, res, next)
 */
exports.addOption = function (app: express$Application, optionKey: string, route: string, doFunction: () => {}) {
  const optionPath: string = versionPath + 'triggers/' + route + '/fields/' + optionKey + '/options';
  app.post(optionPath, doFunction);
};


/**
 * Generic wrapper for simple event-type based Triggers
 * @param app
 * @param {String} route '/new-note'
 * @param {String | Function} dataType 'note/txt', if function it will return the required DataType
 * @param {Function} map function(event, eventData)
 */
exports.setup = function (app: express$Application, route: string, dataType: string | () => {}, mapFunction: () => {}) {
  const triggerPath: string = versionPath + 'triggers/' + route;

  app.post(triggerPath + '/fields/streamId/options', require('../../../fields/stream').options);

  app.post(triggerPath, function (req, res, next) {
    
    const pryvCredentials: Credentials = req.pryvCredentials;

    const body = req.body;

    //---- construct the filter

    const filterLike = {
      limit: 50
    };
    if (body.limit != null || body.limit === 0) {
      filterLike.limit = body.limit;
    }

    if (body.triggerFields == null) {
      return next(errors.contentError('No triggerFields'));
    }
    const triggerFields = body.triggerFields;

    if (typeof dataType === 'function') {

      filterLike.types = dataType(triggerFields);
      if (! filterLike.types) {
        return next(errors.contentError('Cannot determine dataType (eventType)'));
      }
    } else {
      filterLike.types = [dataType];
    }

    if ( triggerFields.streamId == null ) {
      return next(errors.contentError('No StreamId'));
    }

    if (triggerFields.streamId !== constants.ANY_STREAMS) {
      filterLike.streams = [triggerFields.streamId];
    }

    //-- skip
    if (filterLike.limit === 0) {
      return res.send({data : []});
    }

    // -- fetch the events
    request.get(pryvCredentials.urlEndpoint + '/events')
      .set('Authorization', pryvCredentials.pryvToken)
      .query(filterLike)
      .end(function (error, response) {
        
        if (error != null) { 
          return next(errors.internalError('Failed fetching events', error)); 
        }
  
        const eventsArray = response.body.events;

        // -- get the streamsMap for the names
        cache.getStreamsMap(pryvCredentials, function (error, streamMap) {
          if (error != null) {
            return next(errors.internalError('Failed fetching streams from cache', error));
          }

          const data = [];  // will be sent

          eventsArray.forEach(function (event) {

            if (filterLike.types.indexOf(event.type) < 0) {
              logger.error('trigger ' + route + ' get an event with type : ' + event.type);
            }  else {

              let streamId: string =  event.streamId;
              let streamName: string = '';
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
              event.pryvCredentials = pryvCredentials;

              //-- add extra informations
              mapFunction(event, eventData);
              data.push(eventData);
            }
          });
          if (config.get('debug:logNewEventTrigger')) {
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
