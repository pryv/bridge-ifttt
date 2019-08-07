// @flow
const errors = require('../errors/factory');
const config = require('../utils/config');
const channelApiKey: string = config.get('ifttt:channelApiKey');

module.exports = function (req: express$Request, res: express$Response, next: express$NextFunction) {

  const iftttChanelKey: ?string = req.get('IFTTT-Channel-Key');
  const authHeader: ?string = req.get('Authorization');
  if (iftttChanelKey == null && authHeader == null) {
    return next(errors.authentificationRequired('Missing Authorization'));
  }

  // handled by bearerAuth
  if (authHeader != null) return next();

  if (iftttChanelKey == null) {
    return next(errors.authentificationRequired('IFTTT-Channel-Key header missing'));
  }
  if (iftttChanelKey !== channelApiKey) {
    return next(errors.authentificationRequired('IFTTT-Channel-Key header bad content'));
  }

  req.iftttAuthorized = true;
  return next();
};