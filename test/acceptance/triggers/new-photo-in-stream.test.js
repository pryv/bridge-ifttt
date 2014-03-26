/*global describe, before, it */
var config = require('../../../source/utils/config'),
  db = require('../../../source/storage/database'),
  request = require('superagent');

require('../../../source/server');

require('readyness/wait/mocha');

require('should');

var serverBasePath = 'http://' + config.get('http:ip') + ':' + config.get('http:port');

describe('/triggers/new-photo-in-stream/', function () {

  before(function () {
    db.setSet('OI2O98AHF9A', {username: 'ifttttest', pryvToken: 'cht8va9t9001he943bk8o4dhu'});
  });

  describe('fields/stream/options', function () {
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

  describe('/', function () {

    it('POST Valid token', function (done) {
      request.post(serverBasePath + '/ifttt/v1/triggers/new-photo-in-stream')
        .set('Authorization', 'Bearer OI2O98AHF9A').send({
          triggerFields : {
            stream: 'diary'
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
            event.should.have.property('ImageURL'); // TODO eventually check url
          });


          console.log(res.body.data);
          done();
        });
    });
  });
});