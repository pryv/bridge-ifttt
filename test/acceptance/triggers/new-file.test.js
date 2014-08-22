/*global describe, before, it */
var config = require('../../../source/utils/config'),
  db = require('../../../source/storage/database'),
  request = require('superagent');


var testData = require('../../test-data.js');


require('../../../source/server');

require('readyness/wait/mocha');

require('should');

var serverBasePath = 'http://' + config.get('http:ip') + ':' + config.get('http:port');

describe('/triggers/new-file/', function () {
  this.timeout(5000);
  before(function () {
    db.setSet(testData.oauthToken, testData.userAccess);
  });

  describe('fields/streamId/options', function () {
    it('POST Valid token', function (done) {
      request.post(serverBasePath + '/ifttt/v1/triggers/new-file/fields/streamId/options')
        .set('Authorization', 'Bearer ' + testData.oauthToken)
        .end(function (res) {
          res.should.have.status(200);
          res.body.should.have.property('data');
          res.body.data.should.be.an.instanceof(Array);
          done();
        });
    });
  });

  describe('/', function () {

    it('POST Valid token', function (done) {
      request.post(serverBasePath + '/ifttt/v1/triggers/new-file')
        .set('Authorization', 'Bearer ' + testData.oauthToken).send({
          triggerFields : {
            streamId: testData.streamId
          }
        })
        .end(function (res) {
          res.should.have.status(200);
          res.body.should.have.property('data');
          res.body.data.should.be.an.instanceof(Array);

          res.body.data.forEach(function (event) {
            event.should.have.property('meta');
            event.meta.should.have.property('id');
            event.meta.should.have.property('timestamp');

            event.should.have.property('StreamName');
            event.should.have.property('AtTime'); // TODO test iso format
            event.should.have.property('Tags');
            event.should.have.property('FileURL'); // TODO eventually check url
            event.should.have.property('FileName');
          });


          console.log(res.body.data);
          done();
        });
    });
  });
});
