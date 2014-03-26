
var versionPath = '/ifttt/v1/';
var triggerSlug = 'new-photo-in-stream';

module.exports = function setup(app) {

  app.post(versionPath + 'triggers/' + triggerSlug + '/fields/stream/options',
    require('../../../fields/stream').options);
};
