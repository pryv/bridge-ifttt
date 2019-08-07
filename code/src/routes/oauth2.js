// @flow

const errors = require('../errors/factory');
const db = require('../storage/database');
const config = require('../utils/config');
const request = require('superagent');
const hat = require('hat');

const accessUrl: string = config.get('pryv:access');
const domain: string = config.get('pryv:domain');

const secretPath: string = config.get('oauth:secretPath');

const bridgeUrl: string = config.get('ifttt:bridgeUrl');

module.exports = function setup(app: express$Application) {

  // Show them the "do you authorise xyz app to access your content?" page
  app.get('/oauth2/authorise', function (req: express$Request, res: express$Response, next: express$NextFunction) {
    const parameters = {
      //sso: req.signedCookies.sso,
      requestingAppId: req.query.client_id,
      requestedPermissions: [
        {streamId : '*', level: 'manage'},
        {streamId : 'ifttt', defaultName: 'IFTTT', level: 'manage'}
      ], // TODO adapt to clientId
      languageCode: 'en',
      returnURL: req.query.redirect_uri + '?',
      oauthState: req.query.state
    };

    request.post(accessUrl).send(parameters).end(function (error, response) {
      if (error == null && response.status !== 201) {
        error = new Error('Failed requesting access from register invalid statusCode:' +
          response.status + ' body:' + response.body);
      }
      if ( error == null && response.body.url == null) {
        error = new Error('Invalid response, missing url:' + response.body);
      }
      if (error != null) {
        return next(error); // TODO forge a JSON error
      }

      res.redirect(response.body.url);
    });
  });


  /**
   * 1. Verifies IFTTT's client_id and secret
   * 2. Makes oAuth call to access/${code}
   * 3. Retrieves Pryv.io credentials
   * 4. Stores them as: new IFTTTtoken: credentials (urlEndpoint, pryvToken)
   * 5. Create webhook with IFTTTtoken in query
   * 6. Reply to IFTTT with new token
   */
  app.post('/oauth2' + secretPath + '/token', async function (req: express$Request, res: express$Response, next: express$NextFunction) {
    const code: number = req.body.code;
    const client_id: string = req.body.client_id;
    const client_secret: string = req.body.client_secret;
    const redirect_uri: string = req.body.redirect_uri;

    if (client_id == null || client_id !== config.get('ifttt:clientId')) {
      return next(errors.contentError('Bad or missing client_id', client_id));
    }
    if (client_secret == null || client_secret !== config.get('ifttt:secret')) {
      return next(errors.contentError('Bad or missing client_secret', client_secret));
    }
    if (code == null) {
      return next(errors.contentError('Missing code'));
    }
    if (redirect_uri == null) {
      return next(errors.contentError('Missing redirect_uri'));
    }

    /**
     * TODO
     * 1- check client_secret / client_id
     * 2- get username / token from access
     */

    let response;
    try {
      response = await request.get(accessUrl + '/' + code);
      const username: string = response.body.username;
      const pryvToken: string = response.body.token;
      if (response.body.username == null || response.body.token == null) {
        return next(errors.internalError('token from access'));
      }

      const urlEndpoint: string = buildUrl(username, domain);

      const credentials = { urlEndpoint: urlEndpoint, pryvToken: pryvToken };
      const oauthToken: string = hat();

      response = await request.post(urlEndpoint + '/webhooks')
        .set('Authorization', pryvToken)
        .set('Content-Type', 'application/json')
        .send({
          url: bridgeUrl + '/webhooks?iftttToken=' + oauthToken
        });

      db.setSet(oauthToken, credentials);

      return res.json({ token_type: 'Bearer', access_token: oauthToken });
    } catch (error) {
      if (
        error.response != null &&
        error.response.body != null &&
        error.response.body.status != 'ACCEPTED'
      ) {
        return next(errors.invalidToken(error.response.body.message));
      }
      return next(errors.internalError('Error while talking with Pryv.io', '', error));
    }

  });
};

function buildUrl(username: string, domain: string): string {
  return 'https://' + username + '.' + domain;
}