const errors = require('../../errors/factory');

const config = require('../../utils/config');
const domain = config.get('pryv:domain');

module.exports = function setup(app) {

// Return the user info
  app.get('/ifttt/v1/user/info', function (req, res, next) {
    const pryvCredentials = req.pryvCredentials;
    if (! pryvCredentials) {
      return next(errors.contentError('No authorization token'));
    } else {
      if (pryvCredentials.urlEndpoint != null) {
        return res.json({
          data: {
            name: pryvCredentials.urlEndpoint,
            id: pryvCredentials.urlEndpoint,
            url: pryvCredentials.urlEndpoint,
          }
        });
      } else {
        return res.json({
          data: {
            name: pryvCredentials.username,
            id: pryvCredentials.username,
            url: 'https://' + pryvCredentials.username + '.' + domain
          }
        });
      }
    }
  });
};

