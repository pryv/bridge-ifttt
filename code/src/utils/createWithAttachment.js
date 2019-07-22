const request = require('superagent');

module.exports = function (pyConn, event, data, options, callback) {

  request
    .post(pyConn.urlEndpoint + '/events')
    .set('Authorization', pyConn.auth)
    .field('event', JSON.stringify(event))
    .attach('attachment0', data, options)
    .end(callback);
};
