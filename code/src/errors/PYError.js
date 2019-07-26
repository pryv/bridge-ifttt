// @flow

const util = require('util');

const SHUSHLOG = require('../../src/utils/config').get('debug:shushPYInternalErrorLog');

/**
 * The constructor to use for all errors within the API.
 *
 * @constructor
 * @param {Number} status
 * @param {String} message
 * @param {Object} details
 */
const PYError = module.exports = function (status: number, message: string, details: string) {
  PYError.super_.call(this);

  this.status = status;
  this.message = message;
  this.details = details;

};

PYError.authentificationRequired = function (message: string, detail: string) {
  return new PYError(401, 'Authentification required: ' + message, detail);
};

PYError.invalidToken = function (message: string, detail: string) {
  return new PYError(401, 'Invalid token: ' + message, detail);
};

PYError.internalError = function (message: string, detail: string, errorForInternalUsage: Error) {
  const e: Error = new Error('Internal Error');
  const stack = e.stack.replace(/^[^\(]+?[\n$]/gm, '')
    .replace(/^\s+at\s+/gm, '')
    .replace(/^Object.<anonymous>\s*\(/gm, '{anonymous}()@')
    .split('\n');
  if (! SHUSHLOG) {
    // console.log(errorForInternalUsage, message, detail, stack);
  }
  return new PYError(500, 'Internal Error: ' + message, detail);
};

PYError.contentError = function (message: string, detail: string) {
  return new PYError(400, 'Content Error: ' + message, detail);
};


util.inherits(PYError, Error);
PYError.prototype.name = 'PYError';
