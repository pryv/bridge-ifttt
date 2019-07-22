const buildAttachmentUrl = require('../../../utils/buildAttachmentUrl');

module.exports = function setup(app) {
  require('./new-event-generic').setup(app, 'new-file', 'file/attached', function (event, map) {
    if (event.attachments == null || event.attachments.length === 0) {
      console.log('Skipping event ' + event.id + ' missing attachment data');
      return map;
    }

    const pyConn = event.pyConn;
    const attachment = event.attachments[0];

    map.FileURL = buildAttachmentUrl(pyConn, event, attachment);
    map.FileName = event.attachments[0].fileName;
    return map;
  });
};

