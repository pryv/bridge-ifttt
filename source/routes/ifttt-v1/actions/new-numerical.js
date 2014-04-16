
var PYError = require('../../../errors/PYError.js');
var generic = require('./new-event-generic');
var dataTypesHandlers = require('../../../fields/data-type');

module.exports = function setup(app) {
  addStaticRoute(app, 'new-numerical-basic', dataTypesHandlers.basic);
};


function addStaticRoute(app, route, dataTypesHandler) {

  generic.addOption(app, 'EventType', route, dataTypesHandler);

  generic.setup(app, route, function (event, actionFields, done) {
    if (! actionFields.EventType) {
      return done(PYError.contentError('missing eventType'));
    }
    event.type = actionFields.EventType;

    if (typeof actionFields.NumericalValue === 'undefined') {
      return done(PYError.contentError('missing numericalValue'));
    }

    // cast string to number
    event.content = actionFields.NumericalValue * 1;
    if (isNaN(event.content)) {
      return done(PYError.contentError('cannot cast value : "' + actionFields.NumericalValue +
        '" to number'));
    }

    return done();
  });
}
