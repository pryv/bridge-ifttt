var express = require('express');


module.exports = function () {

  // init app

  var app = express();
  app.disable('x-powered-by');
  app.use(express.bodyParser());

  //middleware
  app.use(require('./middleware/debug.js'));
  app.use(require('./middleware/bearerAuth.js'));

  // routes
  require('./routes/oauth2.js')(app);
  require('./routes/ifttt-v1/status.js')(app);
  require('./routes/ifttt-v1/user.js')(app);


  require('./routes/ifttt-v1/triggers/new-photo.js')(app);
  require('./routes/ifttt-v1/triggers/new-note.js')(app);

  return app;
};
