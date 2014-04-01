

module.exports = function setup(app) {
  require('./new-event-generic')(app, 'new-note', function (pryvConnection, body) {

    console.log('*23', body);

  });
};

