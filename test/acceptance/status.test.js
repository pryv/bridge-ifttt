/*global describe, it */
var config = require('../../source/utils/config'),
  request = require('superagent');


var should = require('should');
require('../../source/server');


require('readyness/wait/mocha');

var serverBasePath = 'http://' + config.get('http:ip') + ':' + config.get('http:port');

describe('status', function () {

  it('valid auth', function (done) {
    request.get(serverBasePath + '/ifttt/v1/status')
      .set('Accept', 'application/json')
      .set('IFTTT-Channel-Key', config.get('ifttt:channelApiKey'))
      .set('Accept-Charset', 'utf-8')
      .set('Accept-Encoding', 'gzip, deflate')
      .set('Content-Type', 'application/json')
      .end(function (err, res) {
        should.exist(res);
        res.status.should.equal(200);
        done();
      });
  });

  it('invalid auth should fail', function (done) {
    request.get(serverBasePath + '/ifttt/v1/status')
      .set('Accept', 'application/json')
      .set('IFTTT-Channel-Key', 'sss')
      .set('Accept-Charset', 'utf-8')
      .set('Accept-Encoding', 'gzip, deflate')
      .set('Content-Type', 'application/json')
      .end(function (err, res) {
        res.status.should.equal(401);
        done();
      });
  });
});
