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
const accessURL = new url.URL(accessUrl);
const accessHostname = accessURL.origin;
const accessPath = accessURL.pathname;
const code = 'EeZiDfLkTPJJ7l3o';

const testData = require('../test-data');

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

      const pryvToken = testData.endpointAccess.pryvToken;
      const username = testData.endpointAccess.username;
      const userEndpoint = testData.endpointAccess.urlEndpoint;

      before(function () {
        nock(accessHostname)
          .get(accessPath + '/' + code)
          .reply(200, {
            status: 'ACCEPTED',
            username: username,
            token: pryvToken,
            code: 200
          });
      });

      let res, iftttToken;
      before(function (done) {
        this.timeout(5000);
        const parameters = {
          grant_type: 'authorization_code',
          code: code,
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
        assert.equal(creds.urlEndpoint, testData.endpointAccess.urlEndpoint);
        assert.equal(creds.pryvToken, testData.endpointAccess.pryvToken);
      });
      it('should create a webhook with the IFTTT token in URL query params', async function () {
        const res = await request.get(userEndpoint + '/webhooks')
          .set('Authorization', pryvToken);
        const webhooks = res.body.webhooks;
        let found = false;
        webhooks.forEach(w => {
          if (w.url.indexOf(iftttToken) > 0) found = true;
        });
        assert.isTrue(found);
      });
    });

    describe('Invalid Token exchange', function () {

      before(function () {
        nock(accessHostname)
          .get(accessPath + '/' + code)
          .reply(403, {
            status: 'REFUSED',
            reasonID: 'nevermind',
            message: 'doesntmatter'
          });
      });

      let res;
      before( function (done) {
        this.timeout(20000);
        const parameters = {
          grant_type: 'authorization_code',
          code: code,
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



