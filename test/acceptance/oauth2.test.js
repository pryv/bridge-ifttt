/*global describe, before, it */
var should = require('should'),
  config = require('../../lib/utils/config'),
  request = require('superagent'),
  querystring = require('querystring');


require('../../lib/server');

var nock = require('nock');

require('readyness/wait/mocha');

var serverBasePath = 'http://' + config.get('http:ip') + ':' + config.get('http:port'),
  secretPath =  config.get('oauth:secretPath'),
  channelSlug = 'pryv',  // set on ifttt used in   https://ifttt.com/channels/{{channel-slug}}/
  clientId = config.get('ifttt:clientId'),
  secret = config.get('ifttt:secret');


var accessUrl =  config.get('pryv:access');

// https://ifttt.com/developers/docs/protocol_reference#authentication-flow
describe('oauth2', function () {

  describe('/authorize', function () {

    var queryString = querystring.stringify(
      { client_id: clientId,
        response_type: 'code',
        scope: 'ifttt',
        state: 'tzsagast',
        redirect_uri: 'https://ifttt.com/channels/' + channelSlug + '/authorize'});

    it('GET /authorise should redirect to access.html page', function (done) {
      request.get(serverBasePath + '/oauth2/authorise?' + queryString)
        .redirects(0)
        .end(function (err, res) {
          res.status.should.equal(302);
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
      this.timeout(5000);
      var parameters = {
        grant_type: 'authorization_code',
        code: 'EeZiDfLkTPJJ7l3o',
        client_id: clientId,
        client_secret: secret,
        redirect_uri: 'https://ifttt.com/channels/' + channelSlug + '/authorize'
      };


      request.post(serverBasePath + '/oauth2' + secretPath + '/token')
        .send(parameters)
        .redirects(0)
        .end(function (err, res) {
          //console.log(res.status);
          res.status.should.equal(200);
          res.body.token_type.should.eql('Bearer');
          res.body.should.have.property('access_token');
          res.body.should.not.have.property('refresh_token');
          done();
        });
    });

    it('POST /token : Invalid Token exchange', function (done) {
      this.timeout(20000);
      var parameters = {
        grant_type: 'authorization_code',
        code: 'EeZiDfLkTPJJ7l3o',
        client_id: clientId,
        client_secret: secret,
        redirect_uri: 'https://ifttt.com/channels/' + channelSlug + '/authorize'
      };

      request.post(serverBasePath + '/oauth2' + secretPath + '/token')
        .send(parameters)
        .redirects(0)
        .end(function (err, res) {
          //console.log(res.status);
          res.status.should.equal(401);
          done();
        });
    });

  });

});



