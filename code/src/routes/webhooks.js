// @flow
const bluebird = require('bluebird');
const uuidv1 = require('uuid/v1');
const request = require('superagent');

const db = require('../storage/database');
const config = require('../utils/config');
const errors = require('../errors/factory');

const channelServiceKey: string = config.get('ifttt:channelApiKey');
const realtimeApiEndpoint: string = config.get('ifttt:realtimeApiUrlEndpoint');

import type { Credentials } from '../types';

module.exports = function setup(app: express$Application) {

  app.post('/webhooks', async (req: express$Request, res: express$Response, next: express$NextFunction) => {

    if (missingToken((req))) {
      return next(errors.authentificationRequired('missing IFTTT bearer auth token in query parameters', req.query));
    }
    const iftttToken: string = req.query.iftttToken;
    if (invalidType(iftttToken)) {
      return next(errors.invalidToken('invalid token format', iftttToken));
    }

    const credentials: Credentials = await bluebird.fromCallback(cb => db.getSet(iftttToken, cb));
    if (credentials == null) {
      return next(errors.invalidToken('cannot find credentials associated with provided IFTTT bearer token', iftttToken));
    }

    const payload = {
      data: [
        {
          user_id: credentials.urlEndpoint,
        }
      ]
    };

    try {
      await request
        .post(realtimeApiEndpoint)
        .set('IFTTT-Service-Key', channelServiceKey)
        .set('X-Request-ID', uuidv1())
        .send(payload);
    } catch (error) {
      next(error);
    }
    // response to Pryv webhooks service
    // must be 2xx status, body does not matter
    res.status(200).json({ok:1}); 
  });
};

function missingToken(req: express$Request) {
  return req.query == null || req.query.iftttToken == null;
}
function invalidType(token: string) {
  if (typeof token != 'string') return true;
  if (token.length < 1 || token.length > 128) return true;
  return false;
}