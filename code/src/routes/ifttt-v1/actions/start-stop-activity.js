// @flow

const errors = require('../../../errors/factory');
const PYError = require('../../../errors/PYError');
const versionPath = '/ifttt/v1/';
const config = require('../../../utils/config');

import type { Credentials } from '../../../types';

// Draft
// - the lib-js to support / start / stop
// - stream list should display singleActivities indicators

// TODO include in next release
module.exports = function setup(app: express$Application) {
  const actionPath: string = versionPath + 'actions/start-stop-activity';

  app.post(actionPath + '/fields/streamId/options',
    require('../../../fields/stream').optionsStrict);

  app.post(actionPath, function (req: express$Request, res: express$Response, next: express$NextFunction) {
    const pryvCredentials: Credentials = req.pryvCredentials;

    const actionFields = req.body.actionFields;
    if (actionFields == null) {
      return next(errors.contentError('Cannot find actionFields'));
    }

    if (actionFields.streamId == null) {
      return next(errors.contentError('Cannot find actionFields.streamId'));
    }

    if (actionFields.action == null || ['start', 'stop'].indexOf(actionFields.action) < 0) {
      return next(errors.contentError('Cannot find (or invalid) actionFields.action'));
    }

    // --- streamId
    const streamId: string = actionFields.streamId; //TODO check it's valid
    const eventData = {
      streamId: streamId,
      type: 'activity/plain'
    };

    // --- description
    if (actionFields.description != null) { eventData.description = actionFields.description; }

    // --- tags
    if (actionFields.tags != null) {
      const tags: Array<string> = [];
      actionFields.tags.split(',').forEach(function (tag) {
        const limit = 500;
        const cleanTag = tag.trim();
        if(cleanTag.length>limit) {
          cleanTag = cleanTag.substring(0,limit);
        }
        tags.push(cleanTag);
      });
      if (tags.length > 0) {
        eventData.tags = tags;
      }
    }

    // -- to be continued

    function sendResponse(error, event) {
      if (error != null) {
        if (error instanceof PYError) {
          return next(error);
        }
        return next(errors.internalError('Failed creating event '));
      }
      const data = {data: [ {id: event.id} ]};
      if (config.get('debug:logNewEventAction') != null) {
        console.log('OK creating event ', data);
      }
      res.json(data);
    }

    // broken as we don't have libJS's connection object anymore
    if (actionFields.action === 'start') {
      req.pryvConnection.events.start(eventData, sendResponse);
    } else {
      req.pryvConnection.events.stop(eventData, sendResponse);
    }
  });
};

