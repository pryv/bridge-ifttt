/*global describe, before, it */
var config = require('../../../source/utils/config'),
  db = require('../../../source/storage/database'),
  request = require('superagent');

require('../../../source/server');

require('readyness/wait/mocha');

require('should');

var testStreamId = 'chtisiuo4000c0i43ys0czem0';

var serverBasePath = 'http://' + config.get('http:ip') + ':' + config.get('http:port');

describe('/actions/new-photo/', function () {

  before(function () {
    db.setSet('OI2O98AHF9A', {username: 'ifttttest', pryvToken: 'cht8va9t9001he943bk8o4dhu'});
  });


  describe('/', function () {

    it('POST Valid new picture', function (done) {
      request.post(serverBasePath + '/ifttt/v1/actions/new-photo')
        .set('Authorization', 'Bearer OI2O98AHF9A').send(
        { actionFields: {
          Title: 'Tweet by iftttpryv',
          AttachmentUrl: 'http://w.pryv.com/wp-content/uploads/2013/12/logoPryv.png',
          StreamId: testStreamId,
          Tags: 'IFTTT, Photo'
        }
        }).end(function (res) {
          res.should.have.status(200);

          res.body.should.have.property('data');
          res.body.data.should.have.property('id');
          done();
        });
    });
  });

  describe('/', function () {

    it('POST Valid new picture', function (done) {
      request.post(serverBasePath + '/ifttt/v1/actions/new-photo')
        .set('Authorization', 'Bearer OI2O98AHF9A').send(
        { actionFields:
        { StreamId: 'diary',
          AttachmentUrl: 'https://locker.ifttt.com/f/d09e0ea0-5887-40ae-a27e-021a62b13e25',
          Title: 'New photo added to "Camera Roll"',
          Tags: 'IFTTT, iOS Photos' } }).end(function (res) {
          res.should.have.status(200);

          res.body.should.have.property('data');
          res.body.data.should.have.property('id');
          done();
        });
    });
  });

});
