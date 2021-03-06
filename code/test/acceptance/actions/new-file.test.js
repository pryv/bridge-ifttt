/*global describe, before, it */
const config = require('../../../src/utils/config');
const db = require('../../../src/storage/database');
const request = require('superagent');

const testData = require('../../test-data.js');

require('../../../src/server');
require('readyness/wait/mocha');
require('should');

const serverBasePath = 'http://' + config.get('http:ip') + ':' + config.get('http:port');

describe('/actions/new-file/', function () {
  this.timeout(5000);
  before(function () {
    db.setSet(testData.userAccess.oauthToken, testData.userAccess);
  });

  describe('/', function () {

    it('POST Valid new file from Pryv', function (done) {
      request.post(serverBasePath + '/ifttt/v1/actions/new-file')
        .set('Authorization', 'Bearer ' + testData.oauthToken).send(
          { actionFields: {
            description: 'File upload test',
            attachmentUrl: 'http://pryv.com/wp-content/uploads/2014/05/integration-osx-icon315-315x315.png',
            streamId: testData.streamId,
            filename: 'logoPry$à/v2.png',
            tags: 'IFTTT, File'
          }
          }).end(function (err, res) {
          res.status.should.equal(200);
          res.body.should.have.property('data');
          res.body.data.should.be.an.instanceof(Array);
          res.body.data[0].should.have.property('id');
          done();
        });
    });
  });
});
