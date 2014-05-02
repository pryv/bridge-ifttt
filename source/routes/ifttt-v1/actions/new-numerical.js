
var PYError = require('../../../errors/PYError.js');
var generic = require('./new-event-generic');
var dataTypesHandlers = require('../../../fields/data-type');

module.exports = function setup(app) {
  addStaticRoute(app, 'new-numerical-basic', dataTypesHandlers.basic);
};


function addStaticRoute(app, route, dataTypesHandler) {

  generic.addOption(app, 'eventType', route, dataTypesHandler);

  generic.setup(app, route, function (event, actionFields, done) {
    if (! actionFields.eventType) {
      return done(PYError.contentError('missing actionFields.eventType'));
    }
    event.type = actionFields.eventType;

    if (typeof actionFields.numericalValue === 'undefined') {
      return done(PYError.contentError('missing numericalValue'));
    }

    // cast string to number
    event.content = actionFields.numericalValue * 1;
    if (isNaN(event.content)) {
      return done(PYError.contentError('cannot cast value : "' + actionFields.numericalValue +
        '" to number'));
    }

    return done();
  });
}
