/*global describe, before, it */
const request = require('superagent');
const querystring = require('querystring');
const assert = require('chai').assert;
const nock = require('nock');
const hat = require('hat');
const URL = require('url').URL;

const config = require('../../src/utils/config');
const db = require('../../src/storage/database');

require('../../src/server');
require('readyness/wait/mocha');

const serverBasePath = 'http://' + config.get('http:ip') + ':' + config.get('http:port');
const testData = require('../test-data');

// https://platform.ifttt.com/docs/api_reference#realtime-api
describe('webhooks', function () {

  const iftttToken = hat();
  const urlEndpoint = testData.endpointAccess.urlEndpoint;
  const pryvToken = testData.endpointAccess.pryvToken;
  before(function () {
    db.setSet(iftttToken, {
      urlEndpoint: urlEndpoint,
      pryvToken: pryvToken
    });
  });

  describe('POST /webhooks', function () {

    /**
     * 1. make webhook call
     * 2. Pryv.io API responds
     * 3. server must call realtime API
     */

    describe('Valid call', function () {
      const queryString = querystring.stringify({ iftttToken: iftttToken });

      const realTimeEndpoint = new URL('https://realtime.ifttt.com/v1/notifications');
      const channelServiceKey = config.get('ifttt:channelApiKey');

      let headers, body;
      before(function () {
        nock(realTimeEndpoint.origin)
          .post(realTimeEndpoint.pathname)
          .reply(200, function (uri, reqBody) {
            headers = this.req.headers;
            body = reqBody;
            return { ok: 1 };
          });
      });

      let res;
      before(async function () {
        res = await request.post(serverBasePath + '/webhooks?' + queryString);
      });

      it('should respond successfully', function () {
        assert.equal(res.status, 200);
      });
      it('should send the correct headers', function () {
        assert.equal(headers['ifttt-service-key'], channelServiceKey);
        assert.exists(headers['x-request-id']);
      });
      it('should have the correct body', function () {
        const data = body.data;
        assert.exists(data);
        const userData = data[0];
        assert.exists(userData);
        assert.deepEqual(userData, { user_id: urlEndpoint });
      });
    });

    describe('missing IFTTT token', function () {

      let res;
      before(async function () {
        try {
          await request.post(serverBasePath + '/webhooks');
        } catch (error) {
          res = error.response;
        } 
      });

      it('should return an error', function() {
        assert.equal(res.status, 401);
      });
    });

    describe('invalid IFTTT Token', function () {
      let res;
      before(async function() {
        try {
          await request.post(serverBasePath + '/webhooks?iftttToken=');
        } catch (error) {
          res = error.response;
        }
      });

      it('should return an error', function() {
        assert.equal(res.status, 401);
      });
    });

    describe('unknown IFTTT token', function() {
      let res;
      before(async function () {
        try {
          await request.post(serverBasePath + '/webhooks?iftttToken=doesNotMatch');
        } catch (error) {
          res = error.response;
        }
      });

      it('should return an error', function () {
        assert.equal(res.status, 401);
      });
    });



  });
});



