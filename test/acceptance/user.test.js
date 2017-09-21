/*global describe, before, it */
var config = require('../../lib/utils/config'),
  db = require('../../lib/storage/database'),
  request = require('superagent');


var testData = require('../test-data.js');

require('../../lib/server');

require('readyness/wait/mocha');

require('should');

var serverBasePath = 'http://' + config.get('http:ip') + ':' + config.get('http:port');

describe('userinfo', function () {

  before(function () {
    db.setSet(testData.oauthToken, testData.userAccess);
  });

  describe('/ifttt/v1/user/info', function () {

    it('GET /ifttt/v1/user/info - No Authorization header', function (done) {
      request.get(serverBasePath + '/ifttt/v1/user/info')
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
