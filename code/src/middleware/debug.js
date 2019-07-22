
const debug = require('../utils/debug.js');
const config = require('../utils/config.js');
/**
 * Tiny middleware to monitor queries.
 */
module.exports = function (req, res, next) {

  if (! config.get('debug:shushReqUrlLog')) {
    console.log(new Date().toString(), req.url);
  }

  if (config.get('debug:middlewareDebug')) {
    debug.inspect({ url: req.url, method: req.method, head: req.headers, body: req.body});
  }

  if (config.get('debug:oauth') && req.url && req.url.substring(0, 6) === '/oauth') {
    debug.inspect({ url: req.url, method: req.method, head: req.headers, body: req.body});
  }

  //dump.inspect({ url: req.url, method: req.method, cookie: req.cookies, });

  next();
};

