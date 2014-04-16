var util = require('util');

/**
 * The constructor to use for all errors within the API.
 *
 * @constructor
 * @param {Number} status
 * @param {String} message
 * @param {Object} details
 */
var PYError = module.exports = function (status, message, details) {
  PYError.super_.call(this);

  this.status = status;
  this.message = message;
  this.details = details;

};

PYError.authentificationRequired = function (message, detail) {
  return new PYError(401, 'Authentification required: ' + message, detail);
};

PYError.invalidToken = function (message, detail) {
  return new PYError(401, 'Invalid token: ' + message, detail);
};

PYError.internalError = function (message, detail) {
  return new PYError(500, 'Internal Error: ' + message, detail);
};

PYError.contentError = function (message, detail) {
  return new PYError(400, 'Content Error: ' + message, detail);
};


util.inherits(PYError, Error);
PYError.prototype.name = 'PYError';
