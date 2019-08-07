// @flow

const request = require('superagent');

import type { Credentials, Event } from '../types'; 

module.exports = function (pryvCredentials: Credentials, event: Event, data: {}, options: {}, callback: () => void): void {

  request
    .post(pryvCredentials.urlEndpoint + '/events')
    .set('Authorization', pryvCredentials.pryvToken)
    .field('event', JSON.stringify(event))
    .attach('attachment0', data, options)
    .end(callback);
};
