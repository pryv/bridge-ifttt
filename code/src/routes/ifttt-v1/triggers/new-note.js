
module.exports = function setup(app) {
  require('./new-event-generic').setup(app, 'new-note', 'note/txt', function (event, map) {
    map.NoteContent = event.content;
  });
};

