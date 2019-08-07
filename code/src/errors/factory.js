// @flow

const SHUSHLOG = require('../../src/utils/config').get(
  'debug:shushPYInternalErrorLog'
);
const PYError = require('./PYError');

const factory = {};
module.exports = factory;

factory.authentificationRequired = (message: string, detail: string): PYError => {
  return new PYError(401, 'Authentification required: ' + message, detail);
};

factory.invalidToken = (message: string, detail: string): Error => {
  return new PYError(401, 'Invalid token: ' + message, detail);
};

factory.internalError = (message: string, detail: ?string, errorForInternalUsage: ?Error): PYError => {
  const e: Error = new Error('Internal Error');
  const stack = e.stack.replace(/^[^\(]+?[\n$]/gm, '')
    .replace(/^\s+at\s+/gm, '')
    .replace(/^Object.<anonymous>\s*\(/gm, '{anonymous}()@')
    .split('\n');
  if (!SHUSHLOG) {
    // console.log(errorForInternalUsage, message, detail, stack);
  }
  return new PYError(500, 'Internal Error: ' + message, detail);
};

factory.contentError = (message: string, detail: ?string): PYError => {
  return new PYError(400, 'Content Error: ' + message, detail);
};