/*global describe, before, it */
var config = require('../../../source/utils/config'),
  db = require('../../../source/storage/database'),
  request = require('superagent');

require('../../../source/server');

require('readyness/wait/mocha');

require('should');

var testStreamId = 'chtisiuo4000c0i43ys0czem0';

var serverBasePath = 'http://' + config.get('http:ip') + ':' + config.get('http:port');

describe('/actions/new-numerical-*', function () {

  before(function () {
    db.setSet('OI2O98AHF9A', {username: 'ifttttest', pryvToken: 'cht8va9t9001he943bk8o4dhu'});
  });



  describe('basic', function () {

    testEventTypeOption('new-numerical-basic');


    it('POST Valid new numerical value', function (done) {
      request.post(serverBasePath + '/ifttt/v1/actions/new-numerical-basic')
        .set('Authorization', 'Bearer OI2O98AHF9A').send(
        { actionFields: {
          description: 'Numerical Test',
          eventType: 'mass/kg',
          numericalValue: ' -34 ',
          streamId: testStreamId,
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
        .set('Authorization', 'Bearer OI2O98AHF9A').send(
        { actionFields: {
          description: 'Numerical Test',
          numericalValue: ' -34 ',
          streamId: testStreamId,
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
        .set('Authorization', 'Bearer OI2O98AHF9A').send(
        { actionFields: {
          description: 'Numerical Test',
          eventType: 'mass/kg',
          streamId: testStreamId,
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
        .set('Authorization', 'Bearer OI2O98AHF9A').send(
        { actionFields: {
          description: 'Numerical Test',
          eventType: 'mass/kg',
          numericalValue: ' twenty ',
          streamId: testStreamId,
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
      .set('Authorization', 'Bearer OI2O98AHF9A')
      .end(function (res) {
        res.should.have.status(200);
        res.body.should.have.property('data');
        res.body.data.should.be.an.instanceof(Array);
        done();
      });
  });
}
