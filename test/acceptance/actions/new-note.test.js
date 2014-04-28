/*global describe, before, it */
var config = require('../../../source/utils/config'),
  db = require('../../../source/storage/database'),
  request = require('superagent'),
  constants = require('../../../source/utils/constants');

var testData = require('../../test-data.js');

require('../../../source/server');

require('readyness/wait/mocha');

require('should');


var serverBasePath = 'http://' + config.get('http:ip') + ':' + config.get('http:port');

describe('/actions/new-note/', function () {

  before(function () {
    db.setSet(testData.oauthToken, testData.userAccess);
  });

  describe('fields/streamId/options', function () {
    it('POST Valid token', function (done) {
      request.post(serverBasePath + '/ifttt/v1/actions/new-note/fields/streamId/options')
        .set('Authorization', 'Bearer ' + testData.oauthToken)
        .end(function (res) {
          res.should.have.status(200);
          res.body.should.have.property('data');
          res.body.data.should.be.an.instanceof(Array);
          res.body.data[0].value.should.not.equal(constants.ANY_STREAMS);
          done();
        });
    });
  });

  describe('/', function () {

    it('POST  new note with invalid content', function (done) {
      request.post(serverBasePath + '/ifttt/v1/actions/new-note')
        .set('Authorization', 'Bearer ' + testData.oauthToken).send(
        { action: 'dumb'
        }).end(function (res) {
          res.should.have.status(400);
          res.body.should.have.property('errors');
          done();
        });
    });


    it('POST Valid new note', function (done) {
      request.post(serverBasePath + '/ifttt/v1/actions/new-note')
        .set('Authorization', 'Bearer ' + testData.oauthToken).send(
        { actionFields: {
          description: 'Tweet by iftttpryv',
          contentText: 'hello Pryv\n\nhello Pryv\n\n iftttpryv (@iftttpryv) April 2',
          streamId: testData.streamId,
          tags: 'IFTTT, Twitter'
        }
        }).end(function (res) {
          res.should.have.status(200);

          res.body.should.have.property('data');
          res.body.data.should.have.property('id');
          done();
        });
    });


    it('POST Valid new note 2', function (done) {
      request.post(serverBasePath + '/ifttt/v1/actions/new-note')
        .set('Authorization', 'Bearer ' + testData.oauthToken).send(
        { actionFields:
        { description: 'Tweet by iftttpryv',
          contentText: 'toto\n\ntoto\n\nâ iftttpryv (@iftttpryv) ' +
            'April 8, 2014\n\nApril 08, 2014 at 10:56PM',
          streamId: testData.streamId,
          tags: 'IFTTT, Twitter'
        }
        }).end(function (res) {
          res.should.have.status(200);
          res.body.should.have.property('data');
          res.body.data.should.have.property('id');
          done();
        });
    });

    it('POST  new note with invalid stream id', function (done) {
      request.post(serverBasePath + '/ifttt/v1/actions/new-note')
        .set('Authorization', 'Bearer ' + testData.oauthToken).send(
        { actionFields: {
          description: 'Tweet by iftttpryv',
          contentText: 'hello Pryv\n\nhello Pryv\n\n iftttpryv (@iftttpryv) April 2',
          streamId: 'invalidStreamId',
          tags: 'IFTTT, Twitter'
        }
        }).end(function (res) {
          res.should.have.status(500);
          res.body.should.have.property('errors');
          done();
        });
    });



  });
});
