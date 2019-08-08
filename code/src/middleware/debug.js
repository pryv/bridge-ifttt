// @flow
const debug = require('../utils/debug.js');
const config = require('../utils/config.js');
/**
 * Tiny middleware to monitor queries.
 */
module.exports = function (req: express$Request, res: express$Response, next: express$NextFunction) {

  if (config.get('debug:logReqUrl')) {
    console.log(new Date().toString(), req.url);
  }

  if (config.get('debug:logFullRequest')) {
    debug.inspect({ url: req.url, method: req.method, head: req.headers, body: req.body});
  }

  if (config.get('debug:logOAuth') && req.url && req.url.substring(0, 6) === '/oauth') {
    debug.inspect({ url: req.url, method: req.method, head: req.headers, body: req.body});
  }

  //dump.inspect({ url: req.url, method: req.method, cookie: req.cookies, });

  next();
};

