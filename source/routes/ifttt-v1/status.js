var PYError = require('../../errors/PYError.js');


module.exports = function setup(app) {


  // Show the current server status
  app.get('/ifttt/v1/status', function (req, res, next) {

    if (!req.iftttAuthorized) {
      return next(PYError.contentError('No authorization token'));
    }


    var response = {
      data: {
        status: 'OK',
        time: (new Date()).toISOString()
      }
    };
    res.json(response);
  });
};