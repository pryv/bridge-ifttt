var marked = require('marked');
marked.setOptions({
  sanitize: true
});

module.exports = function setup(app) {
  require('./new-event-generic').setup(app, 'new-note', 'note/txt', function (event, map) {
    map.NoteContent = marked(event.content); // Does md to HTML
    return true;
  });
};

