var express = require('express');


module.exports = function () {

  // init app

  var app = express();
  app.disable('x-powered-by');
  app.use(express.bodyParser());

  //middleware
  app.use(require('./middleware/debug.js'));

  // routes
  require('./routes/oauth2.js')(app);
  require('./routes/ifttt-v1/status.js')(app);
  require('./routes/ifttt-v1/user.js')(app);

  return app;
};
