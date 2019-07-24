// @flow
const bluebird = require('bluebird');
const uuidv1 = require('uuid/v1');
const request = require('superagent');

const db = require('../storage/database.js');
const config = require('../utils/config');
const PYError = require('../errors/PYError');

const channelServiceKey: string = config.get('ifttt:channelApiKey');
const realtimeApiEndpoint: string = config.get('ifttt:realtimeApiUrlEndpoint');

type Credentials = {
  username: string,
  urlEndpoint: string,
  pryvToken: string
};

module.exports = function setup(app) {

  app.post('/webhooks', async (req, res, next) => {

    if (missingToken((req))) {
      return next(PYError.authentificationRequired('eorrr'));
    }
    const iftttToken: string = req.query.iftttToken;
    if (invalidType(iftttToken)) {
      return next(PYError.invalidToken('awdnaiwn'));
    }

    const credentials: Credentials = await bluebird.fromCallback(cb => db.getSet(iftttToken, cb));
    if (credentials == null) {
      return next(PYError.invalidToken('awdnaiwn'));
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
    res.status(200).json({ok:1});
  });
};

function missingToken(req) {
  return req.query == null || req.query.iftttToken == null;
}
function invalidType(token) {
  if (typeof token != 'string') return true;
  if (token.length < 1 || token.length > 128) return true;
  return false;
}