/*global describe, before, after, it */
var should = require('should');

var server = require('../../source/server');
var config = require('../../source/utils/config');

var request = require('superagent');




var serverBasePath = 'http://127.0.0.1' + config.get('http:port');
var channelSlug = 'pryv'; // set on ifttt used in   https://ifttt.com/channels/{{channel-slug}}/
var clientId = 'ifttt-all';


// https://ifttt.com/developers/docs/protocol_reference#authentication-flow
describe('oauth2', function () {

  describe('authorize', function () {

    it('/GET redirect to access.html page', function (done) {
      console.log('ashashashjashj');
      request.get(serverBasePath + '/authorise?client_id=' + clientId +
          '&response_type=code&scope=ifttt&state=RANDOMSTRING' +
          '&redirect_uri=https://ifttt.com/channels/' + channelSlug + '/authorize')
        .redirects(0)
        .on('redirect', function(res) {

          res.headers.location.should.include('dsgfdsdfggdfs');

          //done();
        })
        .end(function (res) {

          console.log('*4124512'+res.headers.location);
          res.statusCode.should.equal(0);


          done();
        });
    });
  });

});