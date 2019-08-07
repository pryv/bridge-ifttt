const buildAttachmentUrl = require('../../../utils/buildAttachmentUrl');

module.exports = function setup(app) {
  require('./new-event-generic').setup(app, 'new-photo', 'picture/attached', function (event, map) {
    if (
      event.attachments == null || 
      event.attachments.length === 0) {
      console.log('Skipping event ' + event.id + ' missing attachment data');
      return;
    }
    const pryvCredentials = event.pryvCredentials;
    const attachment = event.attachments[0];
    map.ImageURL = map.FileURL = buildAttachmentUrl(pryvCredentials, event, attachment);
  });
};

