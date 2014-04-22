

module.exports = function setup(app) {
  require('./new-event-generic').setup(app, 'new-photo', 'picture/attached', function (event, map) {
    map.ImageURL = event.attachmentUrl(event.attachments[0]);
  });
};

