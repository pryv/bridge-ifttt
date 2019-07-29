/*global describe, before, it */
const config = require('../../../src/utils/config');
const db = require('../../../src/storage/database');
const request = require('superagent');
const constants = require('../../../src/utils/constants');
const _ = require('lodash');
const assert = require('chai').assert;

const testData = require('../../test-data.js');

require('../../../src/server');

require('readyness/wait/mocha');

require('should');

const serverBasePath = 'http://' + config.get('http:ip') + ':' + config.get('http:port');

describe('/triggers/new-note/', function () {
  this.timeout(5000);
  /*
  before(function () {
    db.setSet(testData.userAccess.oauthToken, testData.userAccess);
  });*/

  const user1 = testData.userAccess;
  const user2 = testData.endpointAccess;
  before(function() {
    db.setSet(user1.oauthToken, _.pick(user1, ['username', 'pryvToken']));
    db.setSet(user2.oauthToken, _.pick(user2, ['urlEndpoint', 'pryvToken']));
  });

  describe('fields/streamId/options', function () {
    it('POST Valid token', function (done) {
      request.post(serverBasePath + '/ifttt/v1/triggers/new-note/fields/streamId/options')
        .set('Authorization', 'Bearer ' + user1.oauthToken)
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
        .set('Authorization', 'Bearer ' + user1.oauthToken).send({
          triggerFields : {
            streamId: testData.streamId
          }
        })
        .end(function (err, res) {
          res.status.should.equal(200);
          res.body.should.have.property('data');
          res.body.data.should.be.an.instanceof(Array);

          const data = res.body.data;
          assert.isAbove(data.length, 0);

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
          done();
        });
    });

    it('POST Valid token urlEndpoint user', function (done) {
      request.post(serverBasePath + '/ifttt/v1/triggers/new-note')
        .set('Authorization', 'Bearer ' + user2.oauthToken).send({
          triggerFields: {
            streamId: testData.streamId
          }
        })
        .end(function (err, res) {
          res.status.should.equal(200);
          res.body.should.have.property('data');
          res.body.data.should.be.an.instanceof(Array);

          const data = res.body.data;
          assert.isAbove(data.length, 0);

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
          done();
        });
    });

    it('POST Valid token ANY STREAMS', function (done) {
      request.post(serverBasePath + '/ifttt/v1/triggers/new-note')
        .set('Authorization', 'Bearer ' + user1.oauthToken).send({
          triggerFields : {
            streamId: constants.ANY_STREAMS
          }
        })
        .end(function (err, res) {
          res.status.should.equal(200);
          res.body.should.have.property('data');
          res.body.data.should.be.an.instanceof(Array);

          const data = res.body.data;
          assert.isAbove(data.length, 0);

          res.body.data.forEach(function (event) {
            event.should.have.property('meta');
            event.meta.should.have.property('id');
            event.meta.should.have.property('timestamp');

            event.should.have.property('StreamName');
            event.should.have.property('AtTime'); // TODO test iso format
            event.should.have.property('Tags');
            event.should.have.property('NoteContent');
          });
          done();
        });
    });
  });
});
