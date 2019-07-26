const PYError = require('../../errors/PYError.js');


module.exports = function setup(app) {


  // Show the current server status
  app.get('/ifttt/v1/status', function (req, res, next) {

    if (!req.iftttAuthorized) {
      return next(PYError.authentificationRequired('Auth key missing or invalid'));
    }

    res.send('');
  });
};