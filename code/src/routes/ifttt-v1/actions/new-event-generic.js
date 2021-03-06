// @flow

const errors = require('../../../errors/factory');
const PYError = require('../../../errors/PYError');
const request = require('superagent');
const versionPath = '/ifttt/v1/';
const config = require('../../../utils/config');

const createWithAttachment = require('../../../utils/createWithAttachment');

import type { Credentials } from '../../../types';

/**
 * Generic extraOption Handler
 * @param app
 * @param {String} optionKey slug for this option
 * @param {String} route 'new-note'
 * @param {Function} doFunction function(req, res, next)
 */
exports.addOption = function (app: express$Application, optionKey: string, route: string, doFunction: () => {}) {
  const optionPath = versionPath + 'actions/' + route + '/fields/' + optionKey + '/options';
  //console.log(optionPath);
  app.post(optionPath, doFunction);
};

/**
 * Generic wrapper for simple event-type based Triggers
 * @param app
 * @param {String} route 'new-note'
 * @param {Function} map function(pryvCredentials, responseBody)
 */
exports.setup = function setup(app: express$Application, route: string, mapFunction: () => {}) {
  const triggerPath = versionPath + 'actions/' + route;

  app.post(triggerPath + '/fields/streamId/options',
    require('../../../fields/stream').optionsStrict);

  app.post(triggerPath, function (req: express$Request, res: express$Response, next: express$NextFunction) {

    const pryvCredentials: Credentials = req.pryvCredentials;    

    const actionFields = req.body.actionFields;
    if (actionFields == null) {
      return next(errors.contentError('Cannot find actionFields'));
    }

    if (actionFields.streamId == null) {
      return next(errors.contentError('Cannot find actionFields.streamId'));
    }


    // --- streamId
    const streamId: string = actionFields.streamId; //TODO check it's valid
    const eventData: {} = {streamId: streamId};

    // --- description
    if (typeof actionFields.description === 'undefined') {
      return next(errors.contentError('Cannot find actionFields.description'));
    }
    actionFields.description = actionFields.description.trim();
    if (actionFields.description.length > 0) {
      eventData.description = actionFields.description;
    }

    // --- tags
    if (typeof actionFields.tags === 'undefined') {
      return next(errors.contentError('Cannot find actionFields.tags'));
    }
    const tags: Array<string> = [];
    actionFields.tags.split(',').forEach(function (tag) {
      const limit = 500;
      let cleanTag = tag.trim();
      if(cleanTag.length>limit) {
        cleanTag = cleanTag.substring(0,limit);
      }
      tags.push(cleanTag);
    });
    if (tags.length > 0) {
      eventData.tags = tags;
    }

    const event = eventData;
    let detailMsg: string = '';

    // --- attachment (only supporting 1 for now)
    fetchAttachment(actionFields, function (error, toAttach) {
      if (error != null) {
        detailMsg = ', cannot fetch attachment';
        return sendResponse(error);
      }


      mapFunction(event, actionFields, function (error) {
        if (error) { return sendResponse(error); }

        if (toAttach != null) {
          detailMsg = 'with attachment';

          const options: {} = {
            contentType: toAttach.type,
            filename: toAttach.filename
          };
          const data = toAttach.data;

          if (config.get('debug:logNewEventAction')) {
            console.log('creating event with attachment and data:', event);
          }
          
          createWithAttachment(pryvCredentials, event, data, options, sendResponse);

        } else {
          if (config.get('debug:logNewEventAction')) {
            console.log('creating event with data:', event);
          }

          request.post(pryvCredentials.urlEndpoint + '/events')
            .set('Authorization', pryvCredentials.pryvToken)
            .set('Content-type', 'application/json')
            .send(event)
            .end(sendResponse);
        }

      });
    });

    // requires access to the express middleware's `res` Express$Response object.
    function sendResponse(error, response) {
      if (error != null) {
        if (error instanceof PYError) {
          return next(error);
        }
        if (config.get('debug:logNewEventAction')) {
          console.log(error);
        }
        return next(errors.internalError('Failed creating event ', detailMsg, error));
      }
      const event = response.body.event;
      const data = { data: [{ id: event.id }] };
      if (config.get('debug:logNewEventAction')) {
        console.log('OK creating event ' + detailMsg, data);
      }
      res.json(data);
    }
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

  const requestSettings = {
    method: 'GET',
    url: actionFields.attachmentUrl,
    encoding: null,
    strictSSL: false
  };

  if (config.get('debug:logNewEventAction')) {
    console.log(requestSettings);
  }
  request.get(actionFields.attachmentUrl).end(function (err, response) {
    if (err) {
      return done(err);
    }
    let type = null;
    if (! response) {
      console.log('<WARNING> attachment fetching response is null', actionFields.attachmentUrl);
    } else if (! response.headers) {
      console.log('<WARNING> attachment fetching response.headers is null', actionFields.attachmentUrl);
    } else {
      type = response.headers['content-type'];
    }
    let filename = actionFields.attachmentUrl.split('/').pop().split('w?')[0] || 'attachment0';


    if (actionFields.filename) {
      const filenameFromUser = actionFields.filename.trim().replace(/[^a-zA-Z0-9.-]/gi, '_');
      if (filenameFromUser.length > 5) {
        filename = filenameFromUser;
      }
    }

    done(null, {
      type : type,
      filename : filename,
      data : response.body
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

