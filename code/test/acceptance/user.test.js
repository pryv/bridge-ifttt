/*global describe, before, it */
const config = require('../../src/utils/config');
const db = require('../../src/storage/database');
const request = require('superagent');
const assert = require('chai').assert;
const _ = require('lodash');

const testData = require('../test-data.js');

require('../../src/server');
require('readyness/wait/mocha');
require('should');

const serverBasePath = 'http://' + config.get('http:ip') + ':' + config.get('http:port');
const userInfoPath = serverBasePath + '/ifttt/v1/user/info';

describe('userinfo', function () {

  const user1 = testData.userAccess;
  const user2 = testData.endpointAccess;
  before(function () {
    db.setSet(user1.oauthToken, _.pick(user1, ['username', 'pryvToken']));
    db.setSet(user2.oauthToken, _.pick(user2, ['urlEndpoint', 'pryvToken']));
  });

  describe('/ifttt/v1/user/info', function () {

    it('GET /ifttt/v1/user/info - No Authorization header', function (done) {
      request.get(userInfoPath)
        .set('Authorization', 'Bearer')
        .set('Accept', 'application/json')
        .set('Accept-Charset', 'utf-8')
        .set('Accept-Encoding', 'gzip, deflate')
        .timeout(5000)
        .end(function (err, res) {
          res.status.should.equal(401);
          res.body.should.have.property('errors');
          done();
        });
    });

    describe('old user', function () {
      it('GET /iftttt/v1/user/info', async function () {
        
        const res = await request
          .get(userInfoPath)
          .set('Authorization', 'Bearer ' + user1.oauthToken);
        const status = res.status;
        const user = res.body.data;

        assert.equal(status, 200);
        assert.deepEqual(user, _.pick(user1, [
          'id',
          'name',
          'url'
        ]));
      });
    });

    describe('new user', function() {
      
      it('GET /iftttt/v1/user/info', async function() {
        const res = await request
          .get(userInfoPath)
          .set('Authorization', 'Bearer ' + user2.oauthToken);
        const status = res.status;
        const user = res.body.data;

        assert.equal(status, 200);
        assert.deepEqual(user, _.pick(user2, [
          'id',
          'name',
          'url'
        ]));
      });
    });
    
    /**
    it('GET /ifttt/v1/user/info - Empty Authorization header', function (done) {
      request.get(serverBasePath + '/ifttt/v1/user/info')
        .set('Authorization', '')
        .set('Accept', 'application/json')
        .set('Accept-Charset', 'utf-8')
        .set('Accept-Encoding', 'gzip, deflate')
        .timeout(5000)
        .end(function (err, res) {
          res.status.should.equal(400);
          res.body.should.have.property('errors');
          done();
        });
    });   **/
     /*
    it('GET /ifttt/v1/user/info - Authorization header contains crap', function (done) {
      request.get(serverBasePath + '/ifttt/v1/user/info')
        .set('Authorization', 'lalal alsd hflas')
        .set('Accept', 'application/json')
        .set('Accept-Charset', 'utf-8')
        .set('Accept-Encoding', 'gzip, deflate')
        .timeout(5000)
        .end(function (err, res) {
          res.status.should.equal(400);
          res.body.should.have.property('errors');
          done();
        });
    });

    it('GET /ifttt/v1/user/info - Invalid token', function (done) {
      request.get(serverBasePath + '/ifttt/v1/user/info')
        .set('Authorization', 'Bearer OI2OPKL23HD3')
        .set('Accept', 'application/json')
        .set('Accept-Charset', 'utf-8')
        .set('Accept-Encoding', 'gzip, deflate')
        .timeout(5000)
        .end(function (err, res) {
          res.status.should.equal(401);
          done();
        });
    });

    */
    /**
    it('GET /ifttt/v1/user/info - Valid token', function (done) {
      request.get(serverBasePath + '/ifttt/v1/user/info')
        .set('Authorization', 'Bearer ' + testData.oauthToken)
        .timeout(5000)
        .end(function (err, res) {
          res.status.should.equal(200);
          res.header['content-type'].should.eql('application/json; charset=utf-8');
          res.body.should.have.property('data');
          res.body.data.should.have.property('name');
          res.body.data.should.have.property('id');
          res.body.data.should.have.property('url');
          done();
        });
    });  **/
  });
});
