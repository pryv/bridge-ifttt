/*global describe, it */
const config = require('../../src/utils/config');
const request = require('superagent');


require('should');
require('../../src/server');


require('readyness/wait/mocha');

const serverBasePath = 'http://' + config.get('http:ip') + ':' + config.get('http:port');

describe('userinfo', function () {

  it('POST /ifttt/v1/test/setup - Channel Test Setup', function (done) {
    request.post(serverBasePath + '/ifttt/v1/test/setup')
      .set('IFTTT-Channel-Key', config.get('ifttt:channelApiKey'))
      .set('Content-Type', 'application/json')
      .set('Content-Length', 0)
      .end(function (err, res) {
        res.status.should.equal(200);
        res.body.should.have.property('data');
        res.body.data.should.have.property('samples');
        res.body.data.should.have.property('accessToken');
        done();
      });
  });
});
