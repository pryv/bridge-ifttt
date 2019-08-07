// @flow

/**
 * The constructor to use for all errors within the API.
 *
 * @constructor
 * @param {Number} status
 * @param {String} message
 * @param {Object} details
 */
class PYError extends Error {

  status: number;
  message: string;
  details: string;

  constructor(status: number, message: string, details: string) {
    super(message);
    this.status = status;
    this.message = message;
    this.details = details;  
  }
}

module.exports = PYError;

