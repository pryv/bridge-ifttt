/*global describe, before, it */
var config = require('../../../source/utils/config'),
  db = require('../../../source/storage/database'),
  request = require('superagent'),
  testData = require('../../test-data.js');

var testData = require('../../test-data.js');

require('../../../source/server');

require('readyness/wait/mocha');

require('should');


var serverBasePath = 'http://' + config.get('http:ip') + ':' + config.get('http:port');

describe('/actions/new-numerical-*', function () {

  before(function () {
    db.setSet(testData.oauthToken, testData.userAccess);
  });



  describe('basic', function () {

    testEventTypeOption('new-numerical-basic');


    it('POST Valid new numerical value', function (done) {
      request.post(serverBasePath + '/ifttt/v1/actions/new-numerical-basic')
        .set('Authorization', 'Bearer ' + testData.oauthToken).send(
        { actionFields: {
          description: 'Numerical Test',
          eventType: 'mass/kg',
          numericalValue: ' -34 ',
          streamId: testData.streamId,
          tags: 'Test'
        }
        }).end(function (res) {
          res.should.have.status(200);

          res.body.should.have.property('data');
          res.body.data.should.have.property('id');
          done();
        });
    });


    it('POST Invalid new numerical value, missing eventType', function (done) {
      request.post(serverBasePath + '/ifttt/v1/actions/new-numerical-basic')
        .set('Authorization', 'Bearer ' + testData.oauthToken).send(
        { actionFields: {
          description: 'Numerical Test',
          numericalValue: ' -34 ',
          streamId: testData.streamId,
          tags: 'Test'
        }
        }).end(function (res) {
          res.should.have.status(400);
          res.body.should.not.have.property('data');
          done();
        });
    });


    it('POST Invalid new numerical value, missing numericalValue', function (done) {
      request.post(serverBasePath + '/ifttt/v1/actions/new-numerical-basic')
        .set('Authorization', 'Bearer ' + testData.oauthToken).send(
        { actionFields: {
          description: 'Numerical Test',
          eventType: 'mass/kg',
          streamId: testData.streamId,
          tags: 'Test'
        }
        }).end(function (res) {
          res.should.have.status(400);
          res.body.should.not.have.property('data');
          done();
        });
    });

    it('POST Invalid new numerical value, unparsable numericalValue', function (done) {
      request.post(serverBasePath + '/ifttt/v1/actions/new-numerical-basic')
        .set('Authorization', 'Bearer ' + testData.oauthToken).send(
        { actionFields: {
          description: 'Numerical Test',
          eventType: 'mass/kg',
          numericalValue: ' twenty ',
          streamId: testData.streamId,
          tags: 'Test'
        }
        }).end(function (res) {
          res.should.have.status(400);
          res.body.should.not.have.property('data');
          done();
        });
    });


  });
});


function testEventTypeOption(slug) {
  it(slug + '/fields/eventType/options', function (done) {
    request.post(serverBasePath + '/ifttt/v1/actions/' + slug + '/fields/eventType/options')
      .set('Authorization', 'Bearer ' + testData.oauthToken)
      .end(function (res) {
        res.should.have.status(200);
        res.body.should.have.property('data');
        res.body.data.should.be.an.instanceof(Array);
        done();
      });
  });
}
