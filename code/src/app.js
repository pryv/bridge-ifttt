// @flow

const express = require('express');
const bodyParser  = require('body-parser');

module.exports = function () {

  // init app

  const app: express$Application = express();
  app.disable('x-powered-by');

  // support empty application/json request
  app.use(function (req: express$Request, res: express$Response, next: express$NextFunction) {
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

  app.all('*', require('./middleware/debug'));

  // no auth needed
  require('./routes/oauth2')(app);

  // implements own auth
  require('./routes/webhooks')(app);

  // routes with IFTTT channel key auth auth
  app.all('*', require('./middleware/iftttChannelKeyAuth'));
  require('./routes/ifttt-v1/test/setup')(app);
  require('./routes/ifttt-v1/status')(app);

  // bearer auth header auth
  app.all('*', require('./middleware/bearerAuth'));

  require('./routes/ifttt-v1/user')(app);
  
  // triggers
  require('./routes/ifttt-v1/triggers/new-photo')(app);
  require('./routes/ifttt-v1/triggers/new-note')(app);
  require('./routes/ifttt-v1/triggers/new-numerical')(app);
  require('./routes/ifttt-v1/triggers/new-file')(app);

  // actions
  require('./routes/ifttt-v1/actions/new-note')(app);
  require('./routes/ifttt-v1/actions/new-photo')(app);
  require('./routes/ifttt-v1/actions/new-numerical')(app);
  require('./routes/ifttt-v1/actions/new-file')(app);
  //require('./routes/ifttt-v1/actions/start-stop-activity.js')(app);

  // error handler
  app.use(require('./middleware/errors'));

  return app;
};
