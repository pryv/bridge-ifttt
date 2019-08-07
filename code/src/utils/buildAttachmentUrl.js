// @flow

const url = require('url');

import type { Credentials, Event, Attachment } from '../types';

module.exports = function (pryvCredentials: Credentials, event: Event, attachment: Attachment) {
  return url.resolve(
    'https://' + pryvCredentials.urlEndpoint,
    '/events/' + event.id + '/' + attachment.id + '?readToken=' + attachment.readToken
  );
};