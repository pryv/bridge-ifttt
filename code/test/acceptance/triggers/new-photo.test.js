/*global describe, before, it */
var config = require('../../../src/utils/config'),
  db = require('../../../src/storage/database'),
  request = require('superagent');


var testData = require('../../test-data.js');


require('../../../src/server');

require('readyness/wait/mocha');

require('should');

var serverBasePath = 'http://' + config.get('http:ip') + ':' + config.get('http:port');

describe('/triggers/new-photo/', function () {
  this.timeout(5000);
  before(function () {
    db.setSet(testData.userAccess.oauthToken, testData.userAccess);
  });

  describe('fields/streamId/options', function () {
    it('POST Valid token', function (done) {
      request.post(serverBasePath + '/ifttt/v1/triggers/new-photo/fields/streamId/options')
        .set('Authorization', 'Bearer ' + testData.userAccess.oauthToken)
        .end(function (err, res) {
          res.status.should.equal(200);
          res.body.should.have.property('data');
          res.body.data.should.be.an.instanceof(Array);
          done();
        });
    });
  });

  describe('/', function () {

    it('POST Valid token', function (done) {
      request.post(serverBasePath + '/ifttt/v1/triggers/new-photo')
        .set('Authorization', 'Bearer ' + testData.userAccess.oauthToken).send({
          triggerFields : {
            streamId: testData.streamId
          }
        })
        .end(function (err, res) {
          res.status.should.equal(200);
          res.body.should.have.property('data');
          res.body.data.should.be.an.instanceof(Array);

          res.body.data.forEach(function (event) { 
            event.should.have.property('meta');
            event.meta.should.have.property('id');
            event.meta.should.have.property('timestamp');

            event.should.have.property('StreamName');
            event.should.have.property('AtTime'); // TODO test iso format
            event.should.have.property('Tags');
            event.should.have.property('ImageURL'); // TODO eventually check url
          });
          done();
        });
    });
  });
});
