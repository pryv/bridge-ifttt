/**
 * Error route handling.
 */

var PYError = require('../errors/PYError');
var logger = require('winston');


module.exports = function handleError(error, req, res /*, next*/) {
  var pyError = null;
  if (error instanceof PYError) {
    pyError = error;
  } else {
    pyError = new PYError(500, 'Internal Error');
  }
  logger.error(pyError);
  res.json({ errors: [ { message: error.message }]}, error.status);
};