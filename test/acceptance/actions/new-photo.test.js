/*global describe, before, it */
var config = require('../../../lib/utils/config'),
  db = require('../../../lib/storage/database'),
  request = require('superagent');

var testData = require('../../test-data.js');

require('../../../lib/server');

require('readyness/wait/mocha');

require('should');

var serverBasePath = 'http://' + config.get('http:ip') + ':' + config.get('http:port');

describe('/actions/new-photo/', function () {
  this.timeout(5000);
  before(function () {
    db.setSet(testData.oauthToken, testData.userAccess);
  });

  describe('/', function () {

    it('POST Valid new picture from Pryv', function (done) {
      request.post(serverBasePath + '/ifttt/v1/actions/new-photo')
        .set('Authorization', 'Bearer ' + testData.oauthToken).send(
        { actionFields: {
          description: 'Tweet by iftttpryv',
          attachmentUrl: 'http://pryv.com/wp-content/uploads/2014/05/integration-osx-icon315-315x315.png',
          streamId: testData.streamId,
          tags: 'IFTTT, Photo'
        }
        }).end(function (err, res) {
        if (err) {
          return done(err);
        }
          res.status.should.equal(200);
          res.body.should.have.property('data');
          res.body.data.should.be.an.instanceof(Array);
          res.body.data[0].should.have.property('id');
          done();
        });
    });
  });
});
