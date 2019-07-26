const PYError = require('../../../errors/PYError.js');

const db = require('../../../storage/database');
const testData = require('../../../../test/test-data.js');

/**
 * https://ifttt.com/developers/docs/channel_testing
 */

module.exports = function setup(app) {

  // Show the current server status
  app.post('/ifttt/v1/test/setup', function (req, res, next) {
    if (!req.iftttAuthorized) {
      return next(PYError.authentificationRequired('Auth key missing or invalid'));
    }

    db.setSet(testData.userAccess.oauthToken, testData.userAccess);


    const response = {
      data: {
        accessToken: testData.userAccess.oauthToken,
        samples: {
          triggers : {
            'new-note' : {
              streamId : testData.streamId
            },
            'new-photo' : {
              streamId : testData.streamId
            },
            'new-numerical' : {
              streamId : testData.streamId,
              eventType : 'mass/kg'
            }
          },
          actions : {
            'new-note' : {
              description: 'Tweet by iftttpryv',
              contentText: 'hello Pryv\n\nhello Pryv\n\n iftttpryv (@iftttpryv) April 2',
              streamId: testData.streamId,
              tags: 'IFTTT, Twitter'
            },
            'new-photo' : {
              streamId: testData.streamId,
              attachmentUrl: 'http://api.pryv.com/assets/images/logo-256-black.png',
              description: 'New photo added to "Camera Roll"',
              tags: 'IFTTT, iOS Photos'
            },
            'new-file' : {
              streamId: testData.streamId,
              attachmentUrl: 'http://api.pryv.com/assets/images/logo-256-black.png',
              description: 'New photo saved as file',
              tags: 'IFTTT, File',
              filename: 'logoPryvX.png'
            },
            'new-numerical-basic' : {
              description: 'Numerical Test',
              eventType: 'mass/kg',
              numericalValue: ' -34 ',
              streamId: testData.streamId,
              tags: 'Test'
            }
          }
        }
      }
    };
    res.json(response);
  });
};