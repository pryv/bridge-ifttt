/*global describe, before, it */
var config = require('../../../source/utils/config'),
  db = require('../../../source/storage/database'),
  request = require('superagent');

require('../../../source/server');

require('readyness/wait/mocha');

require('should');

var serverBasePath = 'http://' + config.get('http:ip') + ':' + config.get('http:port');

describe('userinfo', function () {

  before(function () {
    db.setSet('OI2O98AHF9A', {username: 'perkikiki', pryvToken: 'cht8ntct90000m1wk8y20nr65'});
  });

  describe('/triggers/new-photo-in-stream/fields/stream/options', function () {

    it('POST Valid token', function (done) {
      request.post(serverBasePath + '/ifttt/v1/triggers/new-photo-in-stream/fields/stream/options')
        .set('Authorization', 'Bearer OI2O98AHF9A')
        .end(function (res) {
          res.should.have.status(200);
          res.body.should.have.property('data');
          res.body.data.should.be.an.instanceof(Array);
          done();
        });
    });
  });
});
