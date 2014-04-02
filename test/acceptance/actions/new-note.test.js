/*global describe, before, it */
var config = require('../../../source/utils/config'),
  db = require('../../../source/storage/database'),
  request = require('superagent'),
  constants = require('../../../source/utils/constants');

require('../../../source/server');

require('readyness/wait/mocha');

require('should');

var testStreamId = 'chtisiuo4000c0i43ys0czem0';

var serverBasePath = 'http://' + config.get('http:ip') + ':' + config.get('http:port');

describe('/actions/new-note/', function () {

  before(function () {
    db.setSet('OI2O98AHF9A', {username: 'ifttttest', pryvToken: 'cht8va9t9001he943bk8o4dhu'});
  });

  describe('fields/stream/options', function () {
    it('POST Valid token', function (done) {
      request.post(serverBasePath + '/ifttt/v1/actions/new-note/fields/stream/options')
        .set('Authorization', 'Bearer OI2O98AHF9A')
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
        .set('Authorization', 'Bearer OI2O98AHF9A').send(
        { action: 'dumb'
        }).end(function (res) {
          res.should.have.status(400);
          res.body.should.have.property('errors');
          done();
        });
    });


    it('POST Valid new note', function (done) {
      request.post(serverBasePath + '/ifttt/v1/actions/new-note')
        .set('Authorization', 'Bearer OI2O98AHF9A').send(
        { actionFields: {
          description: 'Tweet by iftttpryv',
          contentText: 'hello Pryv\n\nhello Pryv\n\n iftttpryv (@iftttpryv) April 2',
          streamId: testStreamId,
          tags: 'IFTTT, Twitter'
        }
        }).end(function (res) {
          res.should.have.status(200);
          done();
        });
    });

    it('POST  new note with invalid stream id', function (done) {
      request.post(serverBasePath + '/ifttt/v1/actions/new-note')
        .set('Authorization', 'Bearer OI2O98AHF9A').send(
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
