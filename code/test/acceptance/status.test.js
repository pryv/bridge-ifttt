/*global describe, it */
const config = require('../../src/utils/config');
const request = require('superagent');


const should = require('should');
require('../../src/server');


require('readyness/wait/mocha');

const serverBasePath = 'http://' + config.get('http:ip') + ':' + config.get('http:port');

describe('status', function () {

  it('valid auth', function (done) {
    request.get(serverBasePath + '/ifttt/v1/status')
      .set('IFTTT-Channel-Key', config.get('ifttt:channelApiKey'))
      .end(function (err, res) {
        should.exist(res);
        res.status.should.equal(200);
        done();
      });
  });

  it('invalid auth should fail', function (done) {
    request.get(serverBasePath + '/ifttt/v1/status')
      .set('IFTTT-Channel-Key', 'invalid')
      .end(function (err, res) {
        res.status.should.equal(401);
        done();
      });
  });
});
