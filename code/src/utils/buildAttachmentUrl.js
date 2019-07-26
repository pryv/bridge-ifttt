// @flow

const url = require('url');

import type { PryvConnection, Event, Attachment } from '../types';

module.exports = function(pyConn: PryvConnection, event: Event, attachment: Attachment) {
  return url.resolve(
    'https://' + pyConn.urlEndpoint,
    '/events/' + event.id + '/' + attachment.id + '?readToken=' + attachment.readToken
  );
};