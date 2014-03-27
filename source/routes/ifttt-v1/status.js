
module.exports = function setup(app) {

  // Show the current server status
  app.get('/ifttt/v1/status', function (req, res /*, next*/) {
    var response = {
      data: {
        status: 'OK',
        time: (new Date()).toISOString()
      }
    };
    res.json(response);
  });
};