

module.exports = function setup(app) {
  require('./new-event-generic').setup(app, 'new-file', 'file/attached', function (event, map) {
    if (! event.attachments || event.attachments.length === 0) {
      console.log('Skipping event ' + event.id + ' missing attachment data');
      return false;
    }
    map.FileURL = event.attachmentUrl(event.attachments[0]);
    map.FileName = event.attachments[0].fileName;
    return true;
  });
};

