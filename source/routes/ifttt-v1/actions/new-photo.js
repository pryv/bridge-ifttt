
var request = require('request');

module.exports = function setup(app) {
  require('./new-event-generic')(app, 'new-photo', function (event, actionFields, done) {
    event.type = 'picture/attached';

    var requestSettings = {
      method: 'GET',
      url: actionFields.attachmentUrl,
      encoding: null
    };

    console.log(requestSettings);
    request.get(requestSettings,  function (error, response, body) {
      if (error) { done(error); }


      var type = null;
      if (! response) {
        console.log('<WARNING> new-photo response is null', requestSettings);
      } else if (! response.headers) {
        console.log('<WARNING> new-photo response.heders is null', requestSettings);
      } else {
        type = response.headers['content-type'];
      }

      event.toAttach = {
        type : type,
        filename : 'attachment0',
        data : body
      };

      return done();
    });
  });
};

