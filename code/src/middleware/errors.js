// @flow

/**
 * Error route handling.
 */

const PYError = require('../errors/PYError');
const logger = require('winston');


module.exports = function handleError(error: Error, req: express$Request, res: express$Response, next: express$NextFunction) {
  let pyError = null;
  if (error instanceof PYError) {
    pyError = error;
  } else {
    pyError = PYError.internalError('UnamedPYError', '', error);
  }
  //logger.error(pyError, pyError.detail, error);
  res.status(pyError.status).json({ errors: [ { message: pyError.message }]});
};