/*global describe, before, after, it */
var should = require('should'),
  server = require('../../source/server'),
  config = require('../../source/utils/config'),
  db = require('../../source/storage/database'),
  request = require('superagent');

var serverBasePath = 'http://' + config.get('http:ip') + ':' + config.get('http:port'),
  channelSlug = 'pryv', // set on ifttt used in   https://ifttt.com/channels/{{channel-slug}}/
  clientId = 'ifttt-all';

describe('userinfo', function () {

  before(function () {
    db.setSet('OI2O98AHF9Q', '{username: perkikiki, pryvToken: ASDHUFOAW1234}');
  });

  describe('/ifttt/v1/user/info', function () {

    it('GET /ifttt/v1/user/info - No Authorization header', function (done) {
      request.get(serverBasePath + '/ifttt/v1/user/info')
        .set('Authorization', 'Bearer')
        .set('Accept', 'application/json')
        .set('Accept-Charset', 'utf-8')
        .set('Accept-Encoding', 'gzip, deflate')
        .end(function (res) {
          res.should.have.status(400);
          res.body.should.have.property('errors');
          done();
        });
    });

    it('GET /ifttt/v1/user/info - Empty Authorization header', function (done) {
      request.get(serverBasePath + '/ifttt/v1/user/info')
        .set('Authorization', '')
        .set('Accept', 'application/json')
        .set('Accept-Charset', 'utf-8')
        .set('Accept-Encoding', 'gzip, deflate')
        .end(function (res) {
          res.should.have.status(400);
          res.body.should.have.property('errors');
          done();
        });
    });

    it('GET /ifttt/v1/user/info - Authorization header contains crap', function (done) {
      request.get(serverBasePath + '/ifttt/v1/user/info')
        .set('Authorization', 'lalal alsd hflas')
        .set('Accept', 'application/json')
        .set('Accept-Charset', 'utf-8')
        .set('Accept-Encoding', 'gzip, deflate')
        .end(function (res) {
          res.should.have.status(400);
          res.body.should.have.property('errors');
          done();
        });
    });

    it('GET /ifttt/v1/user/info - Invalid token', function (done) {
      request.get(serverBasePath + '/ifttt/v1/user/info')
        .set('Authorization', 'Bearer OI2O98AHF9F')
        .set('Accept', 'application/json')
        .set('Accept-Charset', 'utf-8')
        .set('Accept-Encoding', 'gzip, deflate')
        .end(function (res) {
          res.should.have.status(401);
          done();
        });
    });

    it('GET /ifttt/v1/user/info - Valid token', function (done) {
      request.get(serverBasePath + '/ifttt/v1/user/info')
        .set('Authorization', 'Bearer OI2O98AHF9Q')
        .set('Accept', 'application/json')
        .set('Accept-Charset', 'utf-8')
        .set('Accept-Encoding', 'gzip, deflate')
        .end(function (res) {
          res.should.have.status(200);
          res.header['content-type'].should.eql('application/json; charset=utf-8')
          res.body.should.have.property('data');
          res.body.data.should.have.property('name');
          res.body.data.should.have.property('id');
          res.body.data.should.not.have.property('url');
          done();
        });
    });


  });
});
