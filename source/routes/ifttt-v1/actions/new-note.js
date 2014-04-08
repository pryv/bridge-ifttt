

module.exports = function setup(app) {
  require('./new-event-generic')(app, 'new-note', function (event, actionFields, done) {
    event.type = 'note/txt';
    event.content = actionFields.contentText;
    return done();
  });
};

