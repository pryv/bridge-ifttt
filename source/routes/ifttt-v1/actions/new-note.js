

module.exports = function setup(app) {
  require('./new-event-generic').setup(app, 'new-note', function (event, actionFields, done) {
    event.type = 'note/txt';
    event.content = actionFields.ContentText;
    return done();
  });
};

