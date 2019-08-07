const errors = require('../../../errors/factory');

module.exports = function setup(app) {
  require('./new-event-generic').setup(app, 'new-file', function (event, actionFields, done) {
    if (! actionFields.attachmentUrl) {
      return done(errors.contentError('Cannot find actionFields.attachmentUrl'));
    }

    event.type = 'file/attached';
    return done();
  });
};

