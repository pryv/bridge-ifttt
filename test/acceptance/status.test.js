/*global describe, it */
var config = require('../../source/utils/config'),
  request = require('superagent');

require('should');
require('../../source/server');

var serverBasePath = 'http://' + config.get('http:ip') + ':' + config.get('http:port');

describe('userinfo', function () {

  it('GET /ifttt/v1/status - Channel Status test', function (done) {
    request.get(serverBasePath + '/ifttt/v1/status')
      .set('Accept', 'application/json')
      .set('Accept-Charset', 'utf-8')
      .set('Accept-Encoding', 'gzip, deflate')
      .set('Content-Type', 'application/json')
      .end(function (res) {
        res.should.have.status(200);
        res.header['content-type'].should.eql('application/json; charset=utf-8');
        res.body.should.have.property('data');
        res.body.data.should.have.property('status', 'OK');
        done();
      });
  });
});
