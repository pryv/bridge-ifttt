/*global describe, before, it */
var config = require('../../../src/utils/config'),
  db = require('../../../src/storage/database'),
  request = require('superagent'),
  constants = require('../../../src/utils/constants');


var testData = require('../../test-data.js');

require('../../../src/server');

require('readyness/wait/mocha');

require('should');

var serverBasePath = 'http://' + config.get('http:ip') + ':' + config.get('http:port');

describe('/triggers/new-note/', function () {
  this.timeout(5000);
  before(function () {
    db.setSet(testData.userAccess.oauthToken, testData.userAccess);
  });

  describe('fields/streamId/options', function () {
    it('POST Valid token', function (done) {
      request.post(serverBasePath + '/ifttt/v1/triggers/new-note/fields/streamId/options')
        .set('Authorization', 'Bearer ' + testData.userAccess.oauthToken)
        .end(function (err, res) {
          res.status.should.equal(200);
          res.body.should.have.property('data');
          res.body.data.should.be.an.instanceof(Array);
          res.body.data[0].value.should.equal(constants.ANY_STREAMS);
          done();
        });
    });
  });

  describe('/', function () {

    it('POST Valid token', function (done) {
      request.post(serverBasePath + '/ifttt/v1/triggers/new-note')
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
            event.should.have.property('NoteContent');
            event.should.have.property('description');
          });


          //console.log(res.body.data);
          done();
        });
    });



    it('POST Valid token ANY STREAMS', function (done) {
      request.post(serverBasePath + '/ifttt/v1/triggers/new-note')
        .set('Authorization', 'Bearer ' + testData.userAccess.oauthToken).send({
          triggerFields : {
            streamId: constants.ANY_STREAMS
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
            event.should.have.property('NoteContent');
          });


          //console.log(res.body.data);
          done();
        });
    });
  });
});
