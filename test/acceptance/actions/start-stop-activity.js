/*global describe, before, it */

var config = require('../../../source/utils/config'),
  db = require('../../../source/storage/database'),
  request = require('superagent');

var testData = require('../../test-data.js');

require('../../../source/server');

require('readyness/wait/mocha');

require('should');

var serverBasePath = 'http://' + config.get('http:ip') + ':' + config.get('http:port');

/**
describe('/actions/start-stop-activity', function () {
  this.timeout(5000);
  before(function () {
    db.setSet(testData.oauthToken, testData.userAccess);
  });

  describe('/', function () {

    it('Start new activity in stream', function (done) {
      request.post(serverBasePath + '/ifttt/v1/actions/start-stop-activity')
        .set('Authorization', 'Bearer ' + testData.oauthToken).send(
        { actionFields: {
          description: 'Na Na Nah',
          streamId: testData.streamId,
          action: 'start',
          tags: 'IFTTT'
        }
        }).end(function (err, res) {
          res.status.should.equal(200);
          res.body.should.have.property('data');
          res.body.data.should.be.an.instanceof(Array);
          res.body.data[0].should.have.property('id');
          done();
        });
    });

    it('Stop any activity in stream', function (done) {
      request.post(serverBasePath + '/ifttt/v1/actions/start-stop-activity')
        .set('Authorization', 'Bearer ' + testData.oauthToken).send(
        { actionFields: {
          description: 'Na Na Nah',
          streamId: testData.streamId,
          action: 'stop',
          tags: 'IFTTT'
        }
        }).end(function (err, res) {
          res.status.should.equal(200);
          res.body.should.have.property('data');
          res.body.data.should.be.an.instanceof(Array);
          res.body.data[0].should.have.property('id');
          done();
        });
    });

  });
});
**/