const buildAttachmentUrl = require('../../../utils/buildAttachmentUrl');

module.exports = function setup(app) {
  require('./new-event-generic').setup(app, 'new-photo', 'picture/attached', function (event, map) {
    if (! event.attachments || event.attachments.length === 0) {
      console.log('Skipping event ' + event.id + ' missing attachment data');
      return map;
    }
    const pyConn = event.pyConn;
    const attachment = event.attachments[0];
    map.ImageURL = map.FileURL = buildAttachmentUrl(pyConn, event, attachment);
    return map;
  });
};

