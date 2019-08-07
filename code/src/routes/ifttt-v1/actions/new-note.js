const errors = require('../../../errors/factory');
const md = require('to-markdown');

module.exports = function setup(app) {
  require('./new-event-generic').setup(app, 'new-note', function (event, actionFields, done) {
    if (! actionFields.contentText) {
      return done(errors.contentError('Cannot find actionFields.contentText'));
    }

    event.type = 'note/txt';
    //event.content = actionFields.contentText;

    // Deactivation html-md because of too much crash
    event.content = md(actionFields.contentText); // Does HTML to md
    return done();
  });
};

