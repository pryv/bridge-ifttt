/*global describe, before, it */
const request = require('superagent');
const querystring = require('querystring');
const assert = require('chai').assert;
const url = require('url');
const nock = require('nock');
const bluebird = require('bluebird');

const config = require('../../src/utils/config');
const db = require('../../src/storage/database');

require('../../src/server');
require('readyness/wait/mocha');

const domain = config.get('pryv:domain');
const serverBasePath = 'http://' + config.get('http:ip') + ':' + config.get('http:port');
const secretPath =  config.get('oauth:secretPath');
const channelSlug = 'pryv';  // set on ifttt used in   https://ifttt.com/channels/{{channel-slug}}/
const clientId = config.get('ifttt:clientId');
const secret = config.get('ifttt:secret');

const accessUrl =  config.get('pryv:access');

// https://ifttt.com/developers/docs/protocol_reference#authentication-flow
// https://platform.ifttt.com/docs/api_reference#service-authentication
describe('oauth2', function () {

  describe('GET /authorize', function () {

    const redirect_uri = 'https://ifttt.com/channels/' + channelSlug + '/authorize';
    const queryString = querystring.stringify(
      { client_id: clientId,
        response_type: 'code',
        scope: 'ifttt',
        state: 'tzsagast',
        redirect_uri: redirect_uri});


    let res, location, locUrl;
    before(function (done) {
      request.get(serverBasePath + '/oauth2/authorise?' + queryString)
        .redirects(0)
        .end(function (err, response) {
          res = response;
          location = res.headers.location;
          locUrl = new url.URL(location);
          done();
        });
    });

    it('should redirect to access.html page', function () {
      assert.equal(res.status, 302);
      assert.exists(res.headers.location);
    });
    it('should have the provided redirectUrl', () => {
      assert.equal(locUrl.searchParams.get('redirectUrl', redirect_uri));
    });
  });

  describe('POST /token', function () {

    describe('Valid token exchange', function () {

      const pryvToken = 'chsow0uiu003dwxwko726x731';
      const username = 'perkikiki';

      let webhookUrl;
      before(function () {
        nock(accessUrl)
          .get('/access/EeZiDfLkTPJJ7l3o')
          .reply(200, {
            status: 'ACCEPTED',
            username: username,
            token: pryvToken,
            code: 200
          });
        nock(buildUrl(username))
          .post('/webhooks')
          .reply(200, function (uri, reqBody) {
            webhookUrl = JSON.parse(reqBody).url;
            return {ok:1};
          });
      });

      let res, iftttToken;
      before(function (done) {
        this.timeout(5000);
        const parameters = {
          grant_type: 'authorization_code',
          code: 'EeZiDfLkTPJJ7l3o',
          client_id: clientId,
          client_secret: secret,
          redirect_uri: 'https://ifttt.com/channels/' + channelSlug + '/authorize'
        };

        request.post(serverBasePath + '/oauth2' + secretPath + '/token')
          .send(parameters)
          .redirects(0)
          .end(function (err, response) {
            res = response;
            done();
          });
      });

      it('should return a successful response', function() {
        assert.equal(res.status, 200);
        assert.equal(res.body.token_type, 'Bearer');
        assert.exists(res.body['access_token']);
        assert.notExists(res.body['refresh_token']);
        iftttToken = res.body['access_token'];
      });
      it('should store the IFTTT and Pryv tokens', async () => {
        const creds = await bluebird.fromCallback(cb => db.getSet(iftttToken, cb ));
        assert.exists(creds);
        assert.equal(creds.urlEndpoint, buildUrl('perkikiki'));
        assert.equal(creds.pryvToken, 'chsow0uiu003dwxwko726x731');
      });
      it('should create a webhook', function () {
        assert.exists(webhookUrl);
        assert.include(webhookUrl, iftttToken);
      });
    });

    function buildUrl(username) {
      return 'https://' + username + '.' + domain;
    }

    describe('Invalid Token exchange', function () {

      before(function () {
        nock(accessUrl)
          .get('/access/EeZiDfLkTPJJ7l3o')
          .reply(403, {
            status: 'REFUSED',
            reasonID: 'nevermind',
            message: 'doesntmatter',
          });
      });

      let res;
      before( function (done) {
        this.timeout(20000);
        const parameters = {
          grant_type: 'authorization_code',
          code: 'EeZiDfLkTPJJ7l3o',
          client_id: clientId,
          client_secret: secret,
          redirect_uri: 'https://ifttt.com/channels/' + channelSlug + '/authorize'
        };

        request.post(serverBasePath + '/oauth2' + secretPath + '/token')
          .send(parameters)
          .redirects(0)
          .end(function (err, response) {
            res = response;
            done();
          });
      });

      it('should return an error', () => {
        assert.equal(res.status, 401);
      });
    });
  });

});



