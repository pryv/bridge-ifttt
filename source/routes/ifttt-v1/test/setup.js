var PYError = require('../../../errors/PYError.js');

var db = require('../../../storage/database');
var testData = require('../../../../test/test-data.js');

/**
 * https://ifttt.com/developers/docs/channel_testing
 */

module.exports = function setup(app) {

  // Show the current server status
  app.post('/ifttt/v1/test/setup', function (req, res, next) {
    if (!req.iftttAuthorized) {
      return next(PYError.authentificationRequired('Auth key missing or invalid'));
    }

    db.setSet(testData.oauthToken, testData.userAccess);


    var response = {
      data: {
        accessToken: testData.oauthToken,
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
              tags: 'IFTTT, Twitter',
              createdAt: 'April 25, 2014 at 12:09PM'
            },
            'new-photo' : {
              streamId: testData.streamId,
              attachmentUrl: 'http://w.pryv.com/wp-content/uploads/2013/12/logoPryv.png',
              description: 'New photo added to "Camera Roll"',
              tags: 'IFTTT, iOS Photos',
              createdAt: 'April 25, 2014 at 12:09PM'
            },
            'new-file' : {
              streamId: testData.streamId,
              attachmentUrl: 'http://w.pryv.com/wp-content/uploads/2013/12/logoPryv.png',
              description: 'New photo saved as file',
              tags: 'IFTTT, File',
              filename: 'logoPryvX.png',
              createdAt: 'April 25, 2014 at 12:09PM'
            },
            'new-numerical-basic' : {
              description: 'Numerical Test',
              eventType: 'mass/kg',
              numericalValue: ' -34 ',
              streamId: testData.streamId,
              tags: 'Test',
              createdAt: 'April 25, 2014 at 12:09PM'
            }
          }
        }
      }
    };
    res.json(response);
  });
};