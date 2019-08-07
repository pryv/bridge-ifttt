// @flow
const errors = require('../errors/factory');
const db = require('../storage/database');
const config = require('../utils/config');

const channelApiKey: string = config.get('ifttt:channelApiKey');
const domain: string = config.get('pryv:domain');

import type { Credentials } from '../types';

module.exports = function (req: express$Request, res: express$Response, next: express$NextFunction) {

  if (! req.get('Authorization')) {
    //---- test related part
    if (req.get('IFTTT-Channel-Key')) {
      if (req.get('IFTTT-Channel-Key') !== channelApiKey) { //-- route /ifttt/v1/test/setup
        return next(errors.authentificationRequired('IFTTT-Channel-Key header bad content'));
      }
      req.iftttAuthorized = true;
    }
    return next();
  } else {
    const authorizationHeader = req.get('Authorization').split(' ');
    if (authorizationHeader.length !== 2) {
      return next(errors.authentificationRequired('Authorization header bad number of arguments'));
    }
    const oauthToken = authorizationHeader[1];


    if (authorizationHeader[0] !== 'Bearer' || !oauthToken) {
      return next(errors.authentificationRequired('Authorization header bad content'));
    }

    //--- end of test related part

    db.getSet(oauthToken, function (error: Error, credentials: Credentials) {
      if (error) {
        return next(errors.internalError('Database error', '', error));
      }
      if (credentials == null ||
        (credentials.username == null && credentials.urlEndpoint == null)
      ) {
        return next(errors.invalidToken());
      }
      
      if (credentials.urlEndpoint != null) {
        const url = credentials.urlEndpoint;
        credentials.username = url.substring(8, url.length - domain.length + 1);
      }

      req.pryvCredentials = credentials;
      
      req.pryvConnection = {
        urlEndpoint: credentials.urlEndpoint || 'https://' + credentials.username + '.' + domain,
        auth: credentials.pryvToken,
        username: credentials.username // for retro-compatibility, see cache
      };

      next();
    });
  }

};

