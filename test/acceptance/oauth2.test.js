/*global describe, before, after, it */


require('../../source/server');

var request = require('superagent');


var serverBasePath = 'http://localhost:8080';
var channelSlug = 'pryv'; // set on ifttt used in   https://ifttt.com/channels/{{channel-slug}}/
var clientId = 'ifttt-all';


// https://ifttt.com/developers/docs/protocol_reference#authentication-flow
describe('oauth2', function () {

  describe('authorize', function () {
    it('/GET redirect to access.html page', function () {

      request.get(serverBasePath + '/authorise?client_id=' + clientId +
          '&response_type=code&scope=ifttt&state=RANDOMSTRING' +
          '&redirect_uri=https://ifttt.com/channels/' + channelSlug + '/authorize')
        .end(function (res) {
          res.statusCode.should.eql(200);


        });
    });
  });

});