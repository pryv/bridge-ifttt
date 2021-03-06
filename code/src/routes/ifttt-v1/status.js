const errors = require('../../errors/factory');


module.exports = function setup(app) {


  // Show the current server status
  app.get('/ifttt/v1/status', function (req, res, next) {

    if (req.iftttAuthorized == null) {
      return next(errors.authentificationRequired('Auth key missing or invalid'));
    }

    res.send('');
  });
};