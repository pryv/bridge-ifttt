

module.exports = function setup(app) {
  require('./new-event-generic').setup(app, 'new-photo', function (event, actionFields, done) {
    event.type = 'picture/attached';
    return done();
  });
};

