
var request = require('request');

module.exports = function setup(app) {
  require('./new-event-generic')(app, 'new-photo', function (event, actionFields, done) {
    event.type = 'picture/attached';

    var requestSettings = {
      method: 'GET',
      url: actionFields.attachmentURL,
      encoding: null
    };

    console.log(requestSettings);
    request.get(requestSettings,  function (error, response, body) {
      if (error) { done(error); }


      event.toAttach = {
        type : response.headers['content-type'],
        filename : 'attachment0',
        data : body
      };

      return done();
    });
  });
};

