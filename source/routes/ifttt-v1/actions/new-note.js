var PYError = require('../../../errors/PYError.js');

module.exports = function setup(app) {
  require('./new-event-generic').setup(app, 'new-note', function (event, actionFields, done) {
    if (! actionFields.contentText) {
      return done(PYError.contentError('Cannot find actionFields.attachmentUrl'));
    }

    event.type = 'note/txt';
    event.content = actionFields.contentText;
    return done();
  });
};

