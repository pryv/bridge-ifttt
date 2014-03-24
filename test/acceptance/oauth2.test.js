/*global describe, before, it */
var should = require('should'),
  config = require('../../source/utils/config'),
  request = require('superagent'),
  querystring = require('querystring');

require('../../source/server');

var nock = require('nock');

require('readyness/wait/mocha');

var serverBasePath = 'http://' + config.get('http:ip') + ':' + config.get('http:port'),
  channelSlug = 'pryv',  // set on ifttt used in   https://ifttt.com/channels/{{channel-slug}}/
  clientId = 'ifttt-all';


var accessUrl =  config.get('pryv:access');

// https://ifttt.com/developers/docs/protocol_reference#authentication-flow
describe('oauth2', function () {

  describe('/authorize', function () {

    var queryString = querystring.stringify(
      { grant_type: 'authorization_code',
        response_type: 'code',
        state: 'tzsagast',
        client_id: clientId,
        client_secret: 'HelloToto',
        redirect_uri: 'https://ifttt.com/channels/' + channelSlug + '/authorize'});

    it('GET /authorise should redirect to access.html page', function (done) {
      request.get(serverBasePath + '/oauth2/authorise?' + queryString)
        .redirects(0)
        .end(function (res) {
          res.should.have.status(302);
          should.exist(res.headers.location);

          done();
        });
    });
  });
  describe('/token', function () {

    before(function () {
      nock(accessUrl)
        .get('/access/EeZiDfLkTPJJ7l3o')
        .reply(200, {
          status: 'ACCEPTED',
          username: 'perkikiki',
          token: 'chsow0uiu003dwxwko726x731',
          code:  200
        });
    });

    it('POST /token : Valid Token exchange', function (done) {

      var parameters = {
        grant_type: 'authorization_code',
        code: 'EeZiDfLkTPJJ7l3o',
        state: 'tzsagast',
        client_id: clientId,
        client_secret: 'HelloToto',
        redirect_uri: 'https://ifttt.com/channels/' + channelSlug + '/authorize'
      };


      request.post(serverBasePath + '/oauth2/token')
        .send(parameters)
        .redirects(0)
        .end(function (res) {
          console.log(res.status);
          res.should.have.status(200);

          res.body.token_type.should.eql('Bearer');
          res.body.should.have.property('access_token');
          res.body.should.not.have.property('refresh_token');
          done();
        });
    });


    it('POST /token : Invalid Token exchange', function (done) {

      var parameters = {
        grant_type: 'authorization_code',
        code: 'EeZiDfLkTPJJ7l3o',
        state: 'tzsagast',
        client_id: clientId,
        client_secret: 'HelloToto',
        redirect_uri: 'https://ifttt.com/channels/' + channelSlug + '/authorize'
      };


      request.post(serverBasePath + '/oauth2/token')
        .send(parameters)
        .redirects(0)
        .end(function (res) {
          console.log(res.status);
          res.should.have.status(200);

          res.body.token_type.should.eql('Bearer');
          res.body.should.have.property('access_token');
          res.body.should.not.have.property('refresh_token');
          done();
        });
    });

    /**
     it('GET /token - Step 4: Token exchange - Failed', function (done) {
      request.post(serverBasePath + '/oauth2/token?client_id=' + clientId +
          '&response_type=code&scope=ifttt&state=FAKE' +
          '&redirect_uri=https://ifttt.com/channels/' + channelSlug + '/authorize')
        .redirects(0)
        .end(function (res) {
          res.should.have.status(401);
          res.body.should.have.property('errors');
          done();
        });
    });     **/

  });

});



