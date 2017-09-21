var express = require('express');
var bodyParser  = require('body-parser');

module.exports = function () {

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

  // See documentation at https://github.com/expressjs/body-parser
  app.use(bodyParser.urlencoded({ 
    extended: false }));
  app.use(bodyParser.json());

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
  require('./routes/ifttt-v1/triggers/new-file.js')(app);

  // actions
  require('./routes/ifttt-v1/actions/new-note.js')(app);
  require('./routes/ifttt-v1/actions/new-photo.js')(app);
  require('./routes/ifttt-v1/actions/new-numerical.js')(app);
  require('./routes/ifttt-v1/actions/new-file.js')(app);
  //require('./routes/ifttt-v1/actions/start-stop-activity.js')(app);

  // error handler
  app.use(require('./middleware/errors.js'));


  return app;
};
