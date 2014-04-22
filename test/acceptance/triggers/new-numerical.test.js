/*global describe, before, it */
var config = require('../../../source/utils/config'),
  db = require('../../../source/storage/database'),
  request = require('superagent'),
  testData = require('../../test-data.js');

require('../../../source/server');

require('readyness/wait/mocha');

require('should');

var serverBasePath = 'http://' + config.get('http:ip') + ':' + config.get('http:port');

describe('/triggers/new-numerical/', function () {

  before(function () {
    db.setSet('OI2O98AHF9A', {username: 'ifttttest', pryvToken: 'cht8va9t9001he943bk8o4dhu'});
  });

  describe('fields/streamId/options', function () {
    it('POST Valid token', function (done) {
      request.post(serverBasePath + '/ifttt/v1/triggers/new-numerical/fields/streamId/options')
        .set('Authorization', 'Bearer OI2O98AHF9A')
        .end(function (res) {
          res.should.have.status(200);
          res.body.should.have.property('data');
          res.body.data.should.be.an.instanceof(Array);
          done();
        });
    });
  });


  describe('fields/eventType/options', function () {
    it('POST Valid token', function (done) {
      request.post(serverBasePath + '/ifttt/v1/triggers/new-numerical/fields/eventType/options')
        .set('Authorization', 'Bearer OI2O98AHF9A')
        .end(function (res) {
          res.should.have.status(200);
          res.body.should.have.property('data');
          res.body.data.should.be.an.instanceof(Array);
          console.log(res.body.data);
          done();
        });
    });
  });

  describe('/', function () {

    it('POST Missing dataType', function (done) {
      request.post(serverBasePath + '/ifttt/v1/triggers/new-numerical')
        .set('Authorization', 'Bearer OI2O98AHF9A').send({
          triggerFields : {
            streamId: testData.streamId
          }
        })
        .end(function (res) {
          res.should.have.status(400);
          done();
        });
    });

    it('POST Valid token and content', function (done) {
      request.post(serverBasePath + '/ifttt/v1/triggers/new-numerical')
        .set('Authorization', 'Bearer OI2O98AHF9A').send({
          triggerFields : {
            streamId: testData.streamId,
            eventType: 'mass/kg'
          }
        })
        .end(function (res) {
          res.should.have.status(200);
          res.body.should.have.property('data');
          res.body.data.should.be.an.instanceof(Array);

          res.body.data.forEach(function (event) {
            event.should.have.property('ifttt');
            event.ifttt.should.have.property('id');
            event.ifttt.should.have.property('timestamp');

            event.should.have.property('StreamName');
            event.should.have.property('At'); // TODO test iso format
            event.should.have.property('Tags');
            event.should.have.property('Value');
            event.should.have.property('UnitSymbol');
            event.UnitSymbol.should.eql('Kg');
            event.should.have.property('UnitName');
            event.UnitName.should.eql('Kilograms');

          });

          console.log(res.body.data);
          done();
        });
    });
  });
});
