

module.exports = function setup(app) {
  require('./new-event-generic')(app, 'new-note', 'note/txt', function (event, map) {
    map.NoteContent = event.content;
  });
};

