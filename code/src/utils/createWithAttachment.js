// @flow

const request = require('superagent');

import type { PryvConnection, Event } from '../types'; 

module.exports = function (pyConn: PryvConnection, event: Event, data: {}, options: {}, callback: () => void): void {

  request
    .post(pyConn.urlEndpoint + '/events')
    .set('Authorization', pyConn.auth)
    .field('event', JSON.stringify(event))
    .attach('attachment0', data, options)
    .end(callback);
};
