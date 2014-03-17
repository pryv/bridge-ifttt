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
    request.get(serverBasePath + '/oauth2/authorise?client_id=' + clientId +
        '&response_type=code&scope=ifttt&state=RANDOMSTRING' +
        '&redirect_uri=https://ifttt.com/channels/' + channelSlug + '/authorize')
      .redirects(0)
      .end(function (res) {
        res.should.have.status(302);
        should.exist(res.headers.location);
        res.headers.location.should.eql('https://abcd.epfl.ch'); //TODO update
        done();
      });
  });

});
