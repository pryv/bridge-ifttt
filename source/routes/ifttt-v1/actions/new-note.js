

module.exports = function setup(app) {
  require('./new-event-generic')(app, 'new-note', function (event, actionFields) {
    event.type = 'note/txt';
    event.content = actionFields.contentText;
    return false;
  });
};

