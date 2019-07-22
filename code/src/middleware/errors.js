/*jshint unused:false */
/**
 * Error route handling.
 */

const PYError = require('../errors/PYError');
const logger = require('winston');


module.exports = function handleError(error, req, res, next) {
  var pyError = null;
  if (error instanceof PYError) {
    pyError = error;
  } else {
    pyError = PYError.internalError('UnamedPYError', '', error);
  }
  //logger.error(pyError, pyError.detail, error);
  res.status(pyError.status).json({ errors: [ { message: pyError.message }]});
};