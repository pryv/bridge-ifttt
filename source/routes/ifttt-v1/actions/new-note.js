var PYError = require('../../../errors/PYError.js');
var md = require('html-md');

module.exports = function setup(app) {
  require('./new-event-generic').setup(app, 'new-note', function (event, actionFields, done) {
    if (! actionFields.contentText) {
      return done(PYError.contentError('Cannot find actionFields.attachmentUrl'));
    }

    event.type = 'note/txt';
    event.content = actionFields.contentText;

    // Deactivation html-md because of too much crash
    //event.content = md(actionFields.contentText); // Does HTML to md
    return done();
  });
};

