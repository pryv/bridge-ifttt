/*global describe, before, it */
const config = require('../../../src/utils/config');
const db = require('../../../src/storage/database');
const request = require('superagent');
const constants = require('../../../src/utils/constants');
const pryv = require('pryv');

const testData = require('../../test-data.js');

require('../../../src/server');

require('readyness/wait/mocha');

require('should');


const serverBasePath = 'http://' + config.get('http:ip') + ':' + config.get('http:port');

describe('/actions/new-note/', function () {

  before(function () {
    db.setSet(testData.userAccess.oauthToken, testData.userAccess);
  });

  describe('fields/streamId/options', function () {
    it('POST Valid token', function (done) {
      request.post(serverBasePath + '/ifttt/v1/actions/new-note/fields/streamId/options')
        .set('Authorization', 'Bearer ' + testData.userAccess.oauthToken)
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
        .set('Authorization', 'Bearer ' + testData.userAccess.oauthToken).send(
        { action: 'dumb'
        }).end(function (err, res) {
          res.status.should.equal(400);
          res.body.should.have.property('errors');
          done();
        });
    });

    it('POST invalid with missing streamId', function (done) {
      request.post(serverBasePath + '/ifttt/v1/actions/new-note')
        .set('Authorization', 'Bearer ' + testData.userAccess.oauthToken).send(
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
        .set('Authorization', 'Bearer ' + testData.userAccess.oauthToken).send(
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
        .set('Authorization', 'Bearer ' + testData.userAccess.oauthToken).send(
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
        .set('Authorization', 'Bearer ' + testData.userAccess.oauthToken).send(
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
        .set('Authorization', 'Bearer ' + testData.userAccess.oauthToken).send(
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
        .set('Authorization', 'Bearer ' + testData.userAccess.oauthToken).send(
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
        .set('Authorization', 'Bearer ' + testData.userAccess.oauthToken).send(
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
        .set('Authorization', 'Bearer ' + testData.userAccess.oauthToken).send(
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
      var bigTag = new Array(600).join('a');
      request.post(serverBasePath + '/ifttt/v1/actions/new-note')
        .set('Authorization', 'Bearer ' + testData.userAccess.oauthToken).send(
        { actionFields: {
          description: 'Note with long tag',
          contentText: 'Hello I have very long tag',
          streamId: testData.streamId,
          tags: bigTag
        }
        }).end(function (err, res) {
          res.status.should.equal(200);
          res.body.should.have.property('data');
          res.body.data.should.be.an.instanceof(Array);
          res.body.data[0].should.have.property('id');
        
          var connection = new pryv.Connection({
            username: testData.userAccess.username,
            auth: testData.userAccess.pryvToken,
            domain: config.get('pryv:domain')
          });
          
          var filter = new pryv.Filter({id: res.body.data[0].id});
          connection.events.get(filter, function (err, events) {
            should.not.exist(err);
            should.exist(events[0]);
            should.exist(events[0].tags);
            should(events[0].tags[0]).be.equal(bigTag.substring(0,500));
            done();
          });
        });
    });

  });
});
