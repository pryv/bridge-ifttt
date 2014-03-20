/*global describe, before, after, it */
var should = require('should'),
  server = require('../../source/server'),
  config = require('../../source/utils/config'),
  request = require('superagent');

var serverBasePath = 'http://' + config.get('http:ip') + ':' + config.get('http:port'),
  channelSlug = 'pryv', // set on ifttt used in   https://ifttt.com/channels/{{channel-slug}}/
  clientId = 'ifttt-all';

describe('userinfo', function () {

  it('GET /ifttt/v1/user/info - Valid token', function (done) {
    request.get(serverBasePath + '/ifttt/v1/user/info')
      .set('Authorization', 'Bearer {{user-access-token}}')
      .set('Accept', 'application/json')
      .set('Accept-Charset', 'utf-8')
      .set('Accept-Encoding', 'gzip, deflate')
      .end(function (res) {
        res.should.have.status(200);
        res.body.should.have.property('data');
        res.body.data.should.have.property('name');
        res.body.data.should.have.property('id');
        res.body.data.should.not.have.property('url');
        done();
      });
  });

  it('GET /ifttt/v1/user/info - Invalid token', function (done) {
    request.get(serverBasePath + '/ifttt/v1/user/info')
      .set('Authorization', 'Bearer OI2O98AHF9QWO848OGQFQ3')
      .set('Accept', 'application/json')
      .set('Accept-Charset', 'utf-8')
      .set('Accept-Encoding', 'gzip, deflate')
      .end(function (res) {
        res.should.have.status(401);
        done();
      });
  });

});
