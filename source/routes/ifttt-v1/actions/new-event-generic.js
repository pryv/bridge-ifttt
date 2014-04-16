var pryv = require('pryv');

var PYError = require('../../../errors/PYError.js');
var request = require('request');
var versionPath = '/ifttt/v1/';


/**
 * Generic extraOption Handler
 * @param app
 * @param {String} optionKey slug for this option
 * @param {String} route 'new-note'
 * @param {Function} doFunction function(req, res, next)
 */
exports.addOption = function (app, optionKey, route, doFunction) {
  var optionPath = versionPath + 'actions/' + route + '/fields/' + optionKey + '/options';
  console.log(optionPath);
  app.post(optionPath, doFunction);
};

/**
 * Generic wrapper for simple event-type based Triggers
 * @param app
 * @param {String} route 'new-note'
 * @param {Function} map function(pryvConnection, responseBody)
 */
exports.setup = function setup(app, route, mapFunction) {
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


    // --- streamId
    var streamId = actionFields.streamId; //TODO check it's valid
    var eventData = {streamId: streamId};

    // --- description
    if (actionFields.Title) { eventData.description = actionFields.Title; }

    // --- tags
    if (actionFields.Tags) {
      var tags = [];
      actionFields.Tags.split(',').forEach(function (tag) {
        tags.push(tag.trim());
      });
      if (tags.length > 0) {
        eventData.tags = tags;
      }
    }




    var event = new pryv.Event(req.pryvConnection, eventData);
    var detailMsg = '';
    var sendResponse = function (error) {
      if (error) {
        if (error instanceof PYError) {
          return next(error);
        }
        return next(PYError.internalError('Failed creating event ' + detailMsg, error));
      }
      var data = {data: { id: event.id }};
      console.log('OK creating event ' + detailMsg, data);
      res.json(data);
    };

    // --- attachment (only supporting 1 for now)
    fetchAttachment(actionFields, function (error, toAttach) {
      if (error) {
        detailMsg = ', cannot fetch attachment';
        return sendResponse(error);
      }

      event.toAttach = toAttach;

      mapFunction(event, actionFields, function (error) {
        if (error) { return sendResponse(error); }

        if (event.toAttach) {
          detailMsg = 'with attachment';

          var attachmentData = {
            type : event.toAttach.type,
            filename: event.toAttach.filename
          };
          var data = event.toAttach.data;
          delete event.toAttach;

          var formData = pryv.utility.forgeFormData('attachment0', data, attachmentData);


          console.log('creating event with attachment and data:', event.getData());
          req.pryvConnection.events.createWithAttachment(event, formData, sendResponse);

        } else {
          console.log('creating event with data:', event.getData());
          req.pryvConnection.events.create(event, sendResponse);
        }

      });
    });
  });
};



/**
 * Helper to fetch attachments
 * @param actionFields
 * @param done
 */
function fetchAttachment(actionFields, done) {
  if (! actionFields.AttachmentUrl) {
    return done(null, null);
  }

  var requestSettings = {
    method: 'GET',
    url: actionFields.AttachmentUrl,
    encoding: null,
    strictSSL: false
  };

  console.log(requestSettings);
  request(requestSettings,  function (error, response, body) {
    if (error) { done(error); }

    var type = null;
    if (! response) {
      console.log('<WARNING> attachment fetching response is null', requestSettings);
    } else if (! response.headers) {
      console.log('<WARNING> attachment fetching response.headers is null', requestSettings);
    } else {
      type = response.headers['content-type'];
    }

    done(null, {
      type : type,
      filename : 'attachment0',
      data : body
    });
  });
}

/*
 { actionFields:
 { description: 'Tweet by iftttpryv',
 contentText: 'hello Pryv\n\nhello Pryv\n\nâ iftttpryv (@iftttpryv) April 2
 , 2014\n\nApril 02, 2014 at 10:17AM',
 stream: 'chtg78vkk00070i43s3q2kosv',
 tags: 'IFTTT, Twitter' } } }
 */

