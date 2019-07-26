// @flow

const PYError = require('../errors/PYError.js');
const db = require('../storage/database.js');
const config = require('../utils/config');
const request = require('superagent');
const hat = require('hat');


const accessUrl: string = config.get('pryv:access');

const secretPath: string = config.get('oauth:secretPath');
const domain: string = config.get('pryv:domain');
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


  // Show them the exchange the bearer for a real token
  app.post('/oauth2' + secretPath + '/token', async function (req: express$Request, res: express$Response, next: express$NextFunction) {
    const code = req.body.code;
    const client_id = req.body.client_id;
    const client_secret = req.body.client_secret;
    const redirect_uri = req.body.redirect_uri;

    if (client_id == null || client_id !== config.get('ifttt:clientId')) {
      return next(PYError.contentError('Bad secret'));
    }
    if (client_secret == null || client_secret !== config.get('ifttt:secret')) {
      return next(PYError.contentError('Bad secret'));
    }
    if (code == null) {
      return next(PYError.contentError('Code missing'));
    }
    if (redirect_uri == null) {
      return next(PYError.contentError('code parameter missing'));
    }

    /**
     * TODO
     * 1- check client_secret / client_id
     * 2- get username / token from access
     */

    let response;
    try {
      response = await request.get(accessUrl + '/' + code);
      const username = response.body.username;
      const pryvToken = response.body.token;
      if (response.body.username == null || response.body.token == null) {
        return next(PYError.internalError('token from access'));
      }

      const urlEndpoint = buildUrl(username, domain);

      const credentials = { urlEndpoint: urlEndpoint, pryvToken: pryvToken };
      const oauthToken = hat();

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
        return next(PYError.invalidToken());
      }
      return next(PYError.internalError('Error while talking with Pryv.io', '', error));
    }

  });
};

function buildUrl(username: string, domain: string) {
  return 'https://' + username + '.' + domain;
}