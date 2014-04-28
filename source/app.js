var express = require('express');

module.exports = function () {

  // init app

  var app = express();
  app.disable('x-powered-by');




  // support empty application/json request
  app.use(function (req, res, next) {
    if (req.headers['content-type'] === 'application/json') {
      if (+req.headers['content-length'] === 0) {
        req._body = true; // skip body parser
      }
    }
    next();
  });


  app.use(express.bodyParser());
  app.use(app.router);
  app.use(require('./middleware/errors.js'));

  //middleware
  app.all('*', require('./middleware/debug.js'));
  app.all('*', require('./middleware/bearerAuth.js'));


  // routes
  require('./routes/oauth2.js')(app);
  require('./routes/ifttt-v1/status.js')(app);
  require('./routes/ifttt-v1/user.js')(app);
  require('./routes/ifttt-v1/test/setup.js')(app);

  // triggers
  require('./routes/ifttt-v1/triggers/new-photo.js')(app);
  require('./routes/ifttt-v1/triggers/new-note.js')(app);
  require('./routes/ifttt-v1/triggers/new-numerical.js')(app);

  // actions
  require('./routes/ifttt-v1/actions/new-note.js')(app);
  require('./routes/ifttt-v1/actions/new-photo.js')(app);
  require('./routes/ifttt-v1/actions/new-numerical.js')(app);

  // error handler


  return app;
};
