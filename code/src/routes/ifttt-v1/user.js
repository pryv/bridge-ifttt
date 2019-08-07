// @flow

import type { Credentials } from '../../types';

module.exports = function setup(app: express$Application) {

  app.get('/ifttt/v1/user/info', function (req: express$Request, res: express$Response, next: express$NextFunction) {
    const pryvCredentials: Credentials = req.pryvCredentials;
    return res.json({
      data: {
        name: pryvCredentials.id,
        id: pryvCredentials.id,
        url: pryvCredentials.urlEndpoint
      }
    });
  });
};

