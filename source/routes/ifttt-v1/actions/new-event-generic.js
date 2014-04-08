var pryv = require('pryv');

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

  app.post(triggerPath + '/fields/streamId/options',
    require('../../../fields/stream').optionsStrict);

  app.post(triggerPath, function (req, res, next) {
    if (! req.pryvConnection) { return next(PYError.authentificationRequired()); }

    if (! req.body.actionFields) {
      return next(PYError.contentError('Cannot find actionFields'));
    }

    var actionFields = req.body.actionFields;

    if (! actionFields.streamId) {
      return next(PYError.contentError('Cannot find streamId'));
    }

    var streamId = actionFields.streamId; //TODO check it's valid



    var eventData = {streamId: streamId};
    if (actionFields.description) { eventData.description = actionFields.description; }
    if (actionFields.tags) {
      var tags = [];
      actionFields.tags.split(',').forEach(function (tag) {
        tags.push(tag.trim());
      });
      if (tags.length > 0) {
        eventData.tags = tags;
      }
    }


    console.log('creating event with data:', eventData);

    var event = new pryv.Event(req.pryvConnection, eventData);
    mapFunction(event, actionFields, function (error) {
      if (error) { return next(error); }


      if (event.toAttach) {
        var attachmentData = { 
          type : event.toAttach.type,
          filename: event.toAttach.filename
        };
        var data = event.toAttach.data;
        delete event.toAttach;

        var formData = pryv.utility.forgeFormData('attachment0', data, attachmentData);

        req.pryvConnection.events.createWithAttachment(event, formData, function (error) {
          if (error) {

            return next(PYError.internalError('Failed creating event with att on backend', error));
          }
          res.send(200);
        });

        return;
      }



      req.pryvConnection.events.create(event, function (error) {
        if (error) {
          return next(PYError.internalError('Failed creating event on backend', error));
        }
        res.send(200);
      });

    });
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

