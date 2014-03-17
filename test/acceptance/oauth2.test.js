/*global describe, before, after, it */
var should = require('should'),
    server = require('../../source/server'),
    config = require('../../source/utils/config'),
    request = require('superagent');

var serverBasePath = 'http://' + config.get('http:ip') + ':' + config.get('http:port'),
    // set on ifttt used in   https://ifttt.com/channels/{{channel-slug}}/
    channelSlug = 'pryv',
    clientId = 'ifttt-all';

// https://ifttt.com/developers/docs/protocol_reference#authentication-flow
describe('oauth2', function () {

  it('GET /authorise should redirect to access.html page', function (done) {
    request.get(serverBasePath + '/oauth2/authorise')
      .send({ grant_type: 'authorization_code',
        code: 'code from step 3',
        client_id: 'IFTTT\'s client ID for your service. Set in your channel configuration',
        client_secret: 'IFTTT\'s client secret for your service. Set in your channel configuration',
        redirect_uri: 'https://ifttt.com/channels/{{channel-slug}}/authorize'})
      .redirects(0)
      .end(function (res) {
        res.should.have.status(302);
        should.exist(res.headers.location);
        res.headers.location.should.eql('https://abcd.epfl.ch'); //TODO update
        done();
      });
  });

  it('GET /token - Step 4: Token exchange', function (done) {
    request.post(serverBasePath + '/oauth2/token?client_id=' + clientId +
        '&response_type=code&scope=ifttt&state=RANDOMSTRING' +
        '&redirect_uri=https://ifttt.com/channels/' + channelSlug + '/authorize')
      .redirects(0)
      .end(function (res) {
        res.should.have.status(200);

        res.header.should.have.property('Accept', 'application/json');
        res.header.should.have.property('Accept-Charset', 'utf-8');
        res.header.should.have.property('Accept-Encoding', 'gzip, deflate');
        res.header.should.have.property('Content-Type', 'application/json');

        res.body.should.have.property('token_type', 'Bearer');
        res.body.should.have.property('access_token', 'Bearer');
        res.body.should.not.have.property('refresh_token');
        done();
      });
  });

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
  });

});
