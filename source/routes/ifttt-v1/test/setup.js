var PYError = require('../../../errors/PYError.js');

var db = require('../../../storage/database');
var testData = require('../../../../test/test-data.js');

/**
 * https://ifttt.com/developers/docs/channel_testing
 */

module.exports = function setup(app) {

  // Show the current server status
  app.post('/ifttt/v1/test/setup', function (req, res, next) {
    if (!req.setupAuthorized) {
      return next(PYError.contentError('No authorization token'));
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
              streamId : {
                valid : testData.streamId
              }
            },
            'new-numerical' : {
              streamId : {
                valid : testData.streamId
              },
              eventType : {
                dataType : 'mass/kg'
              }
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
              streamId: 'diary',
              attachmentUrl: 'https://locker.ifttt.com/f/d09e0ea0-5887-40ae-a27e-021a62b13e25',
              description: 'New photo added to "Camera Roll"',
              tags: 'IFTTT, iOS Photos',
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