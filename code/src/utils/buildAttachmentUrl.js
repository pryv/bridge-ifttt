const url = require('url');

module.exports = function (pyConn, event, attachment) {
  return url.resolve(
    'https://',
    pyConn.urlEndpoint,
    '/events/',
    event.id,
    '/',
    attachment.id,
    '?readToken=',
    attachment.readToken
  );
};