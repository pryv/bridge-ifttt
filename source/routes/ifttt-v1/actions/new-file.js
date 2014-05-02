var PYError = require('../../../errors/PYError.js');

module.exports = function setup(app) {
  require('./new-event-generic').setup(app, 'new-file', function (event, actionFields, done) {
    if (! actionFields.attachmentUrl) {
      return done(PYError.contentError('Cannot find actionFields.attachmentUrl'));
    }

    event.type = 'file/attached';
    return done();
  });
};

