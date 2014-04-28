

module.exports = function setup(app) {
  require('./new-event-generic').setup(app, 'new-photo', 'picture/attached', function (event, map) {
    if (! event.attachments || event.attachments.length === 0) {
      console.log('Skipping event ' + event.id + ' missing attachment data');
      return false;
    }
    map.ImageURL = event.attachmentUrl(event.attachments[0]);
    return true;
  });
};

