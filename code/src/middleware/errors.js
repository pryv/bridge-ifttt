// @flow

/**
 * Error route handling.
 */

const errors = require('../errors/factory');
const PYError = require('../errors/PYError');
const logger = require('winston');


module.exports = function handleError(error: Error, req: express$Request, res: express$Response, next: ?express$NextFunction) {
  let errs = null;
  if (error instanceof PYError) {
    errs = error;
  } else {
    errs = errors.internalError('Unamed PYError', '', error);
  }
  //logger.error(errors, errors.detail, error);
  res.status(errs.status).json({ errors: [ { message: errs.message }]});
};