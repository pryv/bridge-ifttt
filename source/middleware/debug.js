
var debug = require('../utils/debug.js');
var config = require('../utils/config.js');
/**
 * Tiny middleware to monitor queries.
 */
module.exports = function (req, res, next) {

  if (config.get('debug:middlewareDebug'));
  debug.inspect({ url: req.url, method: req.method, head: req.headers, body: req.body});

  //dump.inspect({ url: req.url, method: req.method, cookie: req.cookies, });

  next();
};

