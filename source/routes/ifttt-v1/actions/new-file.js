module.exports = function setup(app) {
  require('./new-event-generic').setup(app, 'new-file', function (event, actionFields, done) {
    event.type = 'file/attached';
    return done();
  });
};

