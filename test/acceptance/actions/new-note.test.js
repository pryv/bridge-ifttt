/*global describe, before, it */
var config = require('../../../source/utils/config'),
  db = require('../../../source/storage/database'),
  request = require('superagent'),
  constants = require('../../../source/utils/constants');

var testData = require('../../test-data.js');

require('../../../source/server');

require('readyness/wait/mocha');

require('should');


var serverBasePath = 'http://' + config.get('http:ip') + ':' + config.get('http:port');

describe('/actions/new-note/', function () {

  before(function () {
    db.setSet(testData.oauthToken, testData.userAccess);
  });

  describe('fields/streamId/options', function () {
    it('POST Valid token', function (done) {
      request.post(serverBasePath + '/ifttt/v1/actions/new-note/fields/streamId/options')
        .set('Authorization', 'Bearer ' + testData.oauthToken)
        .end(function (err, res) {
          res.status.should.equal(200);
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
        .set('Authorization', 'Bearer ' + testData.oauthToken).send(
        { action: 'dumb'
        }).end(function (err, res) {
          res.status.should.equal(400);
          res.body.should.have.property('errors');
          done();
        });
    });

    it('POST invalid with missing streamId', function (done) {
      request.post(serverBasePath + '/ifttt/v1/actions/new-note')
        .set('Authorization', 'Bearer ' + testData.oauthToken).send(
        { actionFields:
        { description: '',
          contentText: 'toto\n\ntoto\n\nâ iftttpryv (@iftttpryv) ' +
          'April 8, 2014\n\nApril 08, 2014 at 10:56PM',
          tags: 'IFTTT, Twitter'
        }
        }).end(function (err, res) {
          res.status.should.equal(400);
          done();
        });
    });

    it('POST invalid with missing description', function (done) {
      request.post(serverBasePath + '/ifttt/v1/actions/new-note')
        .set('Authorization', 'Bearer ' + testData.oauthToken).send(
        { actionFields:
        { contentText: 'toto\n\ntoto\n\nâ iftttpryv (@iftttpryv) ' +
            'April 8, 2014\n\nApril 08, 2014 at 10:56PM',
          streamId: testData.streamId,
          tags: 'IFTTT, Twitter'
        }
        }).end(function (err, res) {
          res.status.should.equal(400);
          done();
        });
    });

    it('POST invalid with missing tags', function (done) {
      request.post(serverBasePath + '/ifttt/v1/actions/new-note')
        .set('Authorization', 'Bearer ' + testData.oauthToken).send(
        { actionFields:
        { description: 'sahshas',
          contentText: 'toto\n\ntoto\n\nâ iftttpryv (@iftttpryv) ' +
          'April 8, 2014\n\nApril 08, 2014 at 10:56PM',
          streamId: testData.streamId
        }
        }).end(function (err, res) {
          res.status.should.equal(400);
          done();
        });
    });


    it('POST Valid new note', function (done) {
      request.post(serverBasePath + '/ifttt/v1/actions/new-note')
        .set('Authorization', 'Bearer ' + testData.oauthToken).send(
        { actionFields: {
          description: 'Tweet by iftttpryv',
          contentText: 'hello Pryv\n\nhello Pryv\n\n iftttpryv (@iftttpryv) April 2',
          streamId: testData.streamId,
          tags: 'IFTTT, Twitter'
        }
        }).end(function (err, res) {
          res.status.should.equal(200);
          res.body.should.have.property('data');
          res.body.data.should.be.an.instanceof(Array);
          res.body.data[0].should.have.property('id');
          done();
        });
    });


    it('POST Valid new note 2', function (done) {
      request.post(serverBasePath + '/ifttt/v1/actions/new-note')
        .set('Authorization', 'Bearer ' + testData.oauthToken).send(
        { actionFields:
        { description: 'Tweet by iftttpryv',
          contentText: 'toto\n\ntoto\n\nâ iftttpryv (@iftttpryv) ' +
            'April 8, 2014\n\nApril 08, 2014 at 10:56PM',
          streamId: testData.streamId,
          tags: 'IFTTT, Twitter'
        }
        }).end(function (err, res) {
          res.status.should.equal(200);
          res.body.should.have.property('data');
          res.body.data.should.be.an.instanceof(Array);
          res.body.data[0].should.have.property('id');
          done();
        });
    });

    it('POST  new note with invalid stream id', function (done) {
      request.post(serverBasePath + '/ifttt/v1/actions/new-note')
        .set('Authorization', 'Bearer ' + testData.oauthToken).send(
        { actionFields: {
          description: 'Tweet by iftttpryv',
          contentText: 'hello Pryv\n\nhello Pryv\n\n iftttpryv (@iftttpryv) April 2',
          streamId: 'invalidStreamId',
          tags: 'IFTTT, Twitter'
        }
        }).end(function (err, res) {
          res.status.should.equal(500);
          res.body.should.have.property('errors');
          done();
        });
    });

    it('POST  new note valid long content', function (done) {
      request.post(serverBasePath + '/ifttt/v1/actions/new-note')
        .set('Authorization', 'Bearer ' + testData.oauthToken).send(
        { actionFields:
        { description: 'Les histoires du jeu vidéo d\'AHL : l\'Atari 2600',
          streamId: testData.streamId,
          contentText: 'Les histoires du jeu vidéo d\'AHL : l\'Atari 2600\nPREMIUM. ' +
            'Amis rétrogamers, voici un nouvel épisode de la Saison 3 des Histoires du ' +
            'Jeu Vidéo d\'AHL ! Et pour l\'occasion, place à une machine mythique : ' +
            'l\'Atari 2600. L\'ami AHL revient donc sur Gameblog avec un retour dans ' +
            'les années 70 avec une machine mythique de l\'histoire du jeu vidéo.\n' +
            'http://ift.tt/1j4FtEK Tags:\nvia Pocket http://ift.tt/1j4FtEK\nApril 27, ' +
            '2014 at 10:31PM http://ift.tt/1j4FtEK',
          tags: 'Les histoires du jeu vidéo d\'AHL : l\'Atari 2600'
        }
        }).end(function (err, res) {
          res.status.should.equal(200);
          res.body.should.have.property('data');
          res.body.data.should.be.an.instanceof(Array);
          res.body.data[0].should.have.property('id');
          done();
        });
    });

    it('POST  new note empty string', function (done) {
      request.post(serverBasePath + '/ifttt/v1/actions/new-note')
        .set('Authorization', 'Bearer ' + testData.oauthToken).send(
        { actionFields:
        { description: 'an event with an empty content',
          streamId: testData.streamId,
          contentText: '',
          tags: 'Les histoires du jeu vidéo d\'AHL : l\'Atari 2600'
        }
        }).end(function (err, res) {
          res.status.should.equal(400);
          res.body.should.have.property('errors');
          done();
        });
    });
    
    it('POST strip tag if too long', function (done) {
      request.post(serverBasePath + '/ifttt/v1/actions/new-note')
        .set('Authorization', 'Bearer ' + testData.oauthToken).send(
        { actionFields: {
          description: 'Note with long tag',
          contentText: 'Hello I have very long tag',
          streamId: testData.streamId,
          tags: new Array(600).join('a');
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
