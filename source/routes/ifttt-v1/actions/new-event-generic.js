var pryv = require('pryv');


var PYError = require('../../../errors/PYError.js');
var request = require('superagent');
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
  var optionPath = versionPath + 'actions/' + route + '/fields/' + optionKey + '/options';
  //console.log(optionPath);
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
      return next(PYError.contentError('Cannot find actionFields.streamId'));
    }


    // --- streamId
    var streamId = actionFields.streamId; //TODO check it's valid
    var eventData = {streamId: streamId};

    // --- description
    if (typeof actionFields.description === 'undefined') {
      return next(PYError.contentError('Cannot find actionFields.description'));
    }
    actionFields.description = actionFields.description.trim();
    if (actionFields.description.length > 0) {
      eventData.description = actionFields.description;
    }

    // --- tags
    if (typeof actionFields.tags === 'undefined') {
      return next(PYError.contentError('Cannot find actionFields.tags'));
    }
    var tags = [];
    actionFields.tags.split(',').forEach(function (tag) {
      tags.push(tag.trim());
    });
    if (tags.length > 0) {
      eventData.tags = tags;
    }


    var event = new pryv.Event(req.pryvConnection, eventData);
    var detailMsg = '';
    var sendResponse = function (error) {
      if (error) {
        if (error instanceof PYError) {
          return next(error);
        }
        if (config.get('debug:newEventAction')) {
          console.log(error);
        }
        return next(PYError.internalError('Failed creating event ', detailMsg, error));
      }
      var data = {data: [ {id: event.id} ]};
      if (config.get('debug:newEventAction')) {
        console.log('OK creating event ' + detailMsg, data);
      }
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

          if (config.get('debug:newEventAction')) {
            console.log('creating event with attachment and data:', event.getData());
          }
          req.pryvConnection.events.createWithAttachment(event, formData, sendResponse);

        } else {
          if (config.get('debug:newEventAction')) {
            console.log('creating event with data:', event.getData());
          }
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
  if (! actionFields.attachmentUrl) {
    return done(null, null);
  }

  var requestSettings = {
    method: 'GET',
    url: actionFields.attachmentUrl,
    encoding: null,
    strictSSL: false
  };

  if (config.get('debug:newEventAction')) {
    console.log(requestSettings);
  }
  request.get(actionFields.attachmentUrl).end(function (err, response) {
    if (err) {
      return done(err);
    }
    var type = null;
    if (! response) {
      console.log('<WARNING> attachment fetching response is null', actionFields.attachmentUrl);
    } else if (! response.headers) {
      console.log('<WARNING> attachment fetching response.headers is null', actionFields.attachmentUrl);
    } else {
      type = response.headers['content-type'];
    }
    var filename = actionFields.attachmentUrl.split('/').pop().split('?')[0] || 'attachment0';


    if (actionFields.filename) {
      var filenameFromUser = actionFields.filename.trim().replace(/[^a-zA-Z0-9.\-]/gi, '_');
      if (filenameFromUser.length > 5) {
        filename = filenameFromUser;
      }
    }

    done(null, {
      type : type,
      filename : filename,
      data : response.body
    });
  /*
  request(requestSettings,  function (error, response, body) {
    if (error) { done(error); }

    var type = null;
    if (! res) {
      console.log('<WARNING> attachment fetching response is null', actionFields.attachmentUrl);
    } else if (! response.headers) {
      console.log('<WARNING> attachment fetching response.headers is null', actionFields.attachmentUrl);
    } else {
      type = res.headers['content-type'];
    }

    // try to guess filename
    var filename = requestSettings.url.split('/').pop().split('?')[0] || 'attachment0';

    if (actionFields.filename) {
      var filenameFromUser = actionFields.filename.trim().replace(/[^a-zA-Z0-9.\-]/gi, '_');
      if (filenameFromUser.length > 5) {
        filename = filenameFromUser;
      }
    }

    done(null, {
      type : type,
      filename : filename,
      data : body
    });
    */
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

