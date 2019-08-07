
const errors = require('../../../errors/factory');
const generic = require('./new-event-generic');
const dataTypesHandlers = require('../../../fields/data-type');

module.exports = function setup(app) {
  addStaticRoute(app, 'new-numerical-basic', dataTypesHandlers.basic);
};


function addStaticRoute(app, route, dataTypesHandler) {

  generic.addOption(app, 'eventType', route, dataTypesHandler);

  generic.setup(app, route, function (event, actionFields, done) {
    if (! actionFields.eventType) {
      return done(errors.contentError('missing actionFields.eventType'));
    }
    event.type = actionFields.eventType;

    if (typeof actionFields.numericalValue === 'undefined') {
      return done(errors.contentError('missing numericalValue'));
    }

    // cast string to number
    event.content = actionFields.numericalValue * 1;
    if (isNaN(event.content)) {
      return done(errors.contentError('cannot cast value : "' + actionFields.numericalValue +
        '" to number'));
    }

    return done();
  });
}
