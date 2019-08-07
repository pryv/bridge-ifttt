// @flow
const errors = require('../errors/factory');
const db = require('../storage/database');
const config = require('../utils/config');

const domain: string = config.get('pryv:domain');

import type { Credentials } from '../types';

/**
 * 1. check Bearer IFTTT token in authorization header
 * 2. retrieve credentials based on IFTTT token key
 * 3. build urlEndpoint or username, wether it is one or the other
 * 4. save those in: req.pryvCredentials
 */
module.exports = function (req: express$Request, res: express$Response, next: express$NextFunction) {

  const authHeader: ?string = req.get('Authorization');

  // it was already checked
  if (authHeader == null) {
    return next(errors.authentificationRequired('Missing Authorization header'));
  }

  const authParts: Array<string> = authHeader.split(' ');
  if (authParts.length !== 2) {
    return next(errors.authentificationRequired('Authorization header has bad number of arguments', authParts));
  }
  const oauthToken: string = authParts[1];


  if (authParts[0] !== 'Bearer' || oauthToken == null) {
    return next(errors.authentificationRequired('Authorization header has bad content', authParts));
  }

  db.getSet(oauthToken, function (error: ?Error, credentials: ?Credentials) {
    if (error != null) {
      return next(errors.internalError('Database error', '', error));
    }
    if (credentials == null ||
      (credentials.username == null && credentials.urlEndpoint == null)
    ) {
      return next(errors.invalidToken('No credentials matching IFTTT token', oauthToken));
    }
    

    if (credentials.urlEndpoint != null) {
      // new user
      const url = credentials.urlEndpoint;
      credentials.username = url.substring(8, url.length - domain.length + 1);
      credentials.id = url;
    } else {
      // old user
      const username = credentials.username;
      credentials.urlEndpoint = 'https://' + username + '.' + domain;
      credentials.id = username;
    }

    req.pryvCredentials = credentials;

    next();
  });
  

};

