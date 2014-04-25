/*global describe, it */
var config = require('../../source/utils/config'),
  request = require('superagent');


require('should');
require('../../source/server');


require('readyness/wait/mocha');

var serverBasePath = 'http://' + config.get('http:ip') + ':' + config.get('http:port');

describe('userinfo', function () {

  it('POST /ifttt/v1/test/setup - Channel Test Setup', function (done) {
    request.post(serverBasePath + '/ifttt/v1/test/setup')
      .set('Authorization', 'Bearer ' + config.get('ifttt:channelApiKey'))
      .end(function (res) {
        res.should.have.status(200);
        res.body.should.have.property('data');
        res.body.data.should.have.property('sample');
        res.body.data.should.have.property('accessToken');
        done();
      });
  });
});
