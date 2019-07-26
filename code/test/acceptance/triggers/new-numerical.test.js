/*global describe, before, it */
const config = require('../../../src/utils/config');
const db = require('../../../src/storage/database');
const request = require('superagent');
const testData = require('../../test-data.js');

require('../../../src/server');

require('readyness/wait/mocha');

require('should');

const serverBasePath = 'http://' + config.get('http:ip') + ':' + config.get('http:port');

describe('/triggers/new-numerical/', function () {

  before(function () {
    db.setSet(testData.userAccess.oauthToken, testData.userAccess);
  });

  describe('fields/streamId/options', function () {
    it('POST Valid token', function (done) {
      request.post(serverBasePath + '/ifttt/v1/triggers/new-numerical/fields/streamId/options')
        .set('Authorization', 'Bearer ' + testData.userAccess.oauthToken)
        .end(function (err, res) {
          res.status.should.equal(200);
          res.body.should.have.property('data');
          res.body.data.should.be.an.instanceof(Array);
          done();
        });
    });
  });


  describe('fields/eventType/options', function () {
    it('POST Valid token', function (done) {
      request.post(serverBasePath + '/ifttt/v1/triggers/new-numerical/fields/eventType/options')
        .set('Authorization', 'Bearer ' + testData.userAccess.oauthToken)
        .end(function (err, res) {
          res.status.should.equal(200);
          res.body.should.have.property('data');
          res.body.data.should.be.an.instanceof(Array);
          //console.log(res.body.data);
          done();
        });
    });
  });

  describe('/', function () {

    it('POST Missing dataType', function (done) {
      request.post(serverBasePath + '/ifttt/v1/triggers/new-numerical')
        .set('Authorization', 'Bearer ' + testData.userAccess.oauthToken).send({
          triggerFields : {
            streamId: testData.streamId
          }
        })
        .end(function (err, res) {
          res.status.should.equal(400);
          done();
        });
    });

    it('POST Valid token and content', function (done) {
      request.post(serverBasePath + '/ifttt/v1/triggers/new-numerical')
        .set('Authorization', 'Bearer ' + testData.userAccess.oauthToken).send({
          triggerFields : {
            streamId: testData.streamId,
            eventType: 'mass/kg'
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
            event.should.have.property('Value');
            event.should.have.property('UnitSymbol');
            event.UnitSymbol.should.eql('Kg');
            event.should.have.property('UnitName');
            event.UnitName.should.eql('Kilograms');

          });

          //console.log(res.body.data);
          done();
        });
    });
  });
});
