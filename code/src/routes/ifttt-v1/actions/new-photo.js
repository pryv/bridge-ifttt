const errors = require('../../../errors/factory');

module.exports = function setup(app) {
  require('./new-event-generic').setup(app, 'new-photo', function (event, actionFields, done) {
    if (! actionFields.attachmentUrl) {
      return done(errors.contentError('Cannot find actionFields.attachmentUrl'));
    }


    event.type = 'picture/attached';
    return done();
  });
};

