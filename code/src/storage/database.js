/*global require*/
//handle the database
var logger = require('winston');
var config = require('../utils/config');
var redis = require('redis').createClient(config.get('redis:port'));
var async = require('async');
var semver = require('semver');

var exports = exports || {}; // just for IJ to present structure

//redis error management
/**
 redis.on('error', function (err) {
  logger.error('Redis: ' + err.message);
});     **/

var LASTEST_DB_VERSION = '0.0.1';
var DBVERSION_KEY = 'dbversion';
var dbversion = null;

var connectionChecked = require('readyness').waitFor('database');


//PASSWORD CHECKING
if (config.get('redis:password')) {
  redis.auth(config.get('redis:password'), function () {
    logger.info('Redis client authentified');
    checkConnection();
  });
} else {
  checkConnection();
}


function checkConnection() {
  //check redis connectivity
  // do not remove, 'wactiv.server' is use by tests
  async.series([
    function (nextStep) { // check db exits
      //var user = { id: 0, email: 'wactiv@pryv.io' };
      //exports.setServerAndInfos('wactiv', config.get('dns:domain'), user, nextStep);


      /**
       * HERE SAVE A SAMPLE KEY/VALUE IN THE DATABASE
       */


      nextStep();
    },
    function (nextStep) { // get db version
      redis.get(DBVERSION_KEY, function (error, result) {
        if (error) { return nextStep(error); }
        dbversion = result;
        if (! dbversion) {
          dbversion = LASTEST_DB_VERSION;
          logger.info('database init to version :' + dbversion);
          redis.set(DBVERSION_KEY, dbversion, nextStep);
        } else {
          logger.info('database version :' + dbversion);
          nextStep();
        }
      });
    },
    function (nextStep) { // update db to version 1
      if (semver.lt(dbversion, LASTEST_DB_VERSION)) { return nextStep(); }

      //logger.info('updating db to version :' + LASTEST_DB_VERSION);

      /**
       * HERE INSERT YOUR DB UPDATE CODE
       */

      nextStep();
    }
  ],
    function (error) {
      if (error) {
        logger.error('DB not available: ', error);
        throw error;
      } else {
        //-- check db structure

        connectionChecked('Redis');
      }
    }
  );
}


/**
 * simply map redis.set
 */
exports.set = function set(key, callback) {
  redis.set(key, callback);
};

/**
 * simply map redis.get
 */
exports.get = function get(key, callback) {
  redis.get(key, callback);
};

/**
 * simply map redis.hgetall
 */
exports.getSet = function getSet(key, callback) {
  redis.hgetall(key, callback);
};

/**
 * simply map redis.hmset
 */
exports.setSet = function getSet(key, callback) {
  redis.hmset(key, callback);
};


function getJSON(key, callback) {
  redis.get(key, function (error, result) {
    var res_json = null;
    if (error) { logger.error('Redis getJSON: ' + key + ' e: ' + error, error); }
    if (! result) { return callback(error, res_json); }
    try {
      res_json = JSON.parse(result);
    } catch (e) {
      error = new Error(e + ' db.getJSON:(' + key + ') string (' + result + ')is not JSON');
    }
    return callback(error, res_json);
  });
}
exports.getJSON = getJSON;



/**
 * "search into keys"
 * @param keyMask  '*:...'
 * @param action function (key)
 * @param done function (error,count) called when done ..  with the count of "action" sent
 */
function doOnKeysMatching(keyMask, action, done) {

  redis.keys(keyMask, function (error, replies) {
    if (error) {
      logger.error('Redis getAllKeysMatchingValue: ' + keyMask + ' e: ' + error, error);
      return  done(error, 0);
    }
    var i, len;
    for (i = 0, len = replies.length; i < len; i++) {
      action(replies[i]);
    }
    done(null, i);
  });
}
exports.doOnKeysMatching = doOnKeysMatching;


/**
 * "search into values "
 * @param keyMask
 * @param valueMask .. a string for now.. TODO a regexp
 * @param done function (error, result_count) called when done ..
 */
function doOnKeysValuesMatching(keyMask, valueMask, action, done) {

  var receivedCount = 0;
  var actionThrown = 0;
  var waitFor = -1;
  var errors = [];

  var checkDone = function () {
    if (waitFor > 0 && waitFor === receivedCount) {
      if (done) {
        done(errors.length === 0 ? null : errors, receivedCount);
      }
    }
  };

  var doOnKeysMatchingDone = function (error, count) {
    waitFor = count;
    checkDone();
  };

  doOnKeysMatching(keyMask,
    function (key) {
      redis.get(key, function (error, result) {
        if (error) {
          errors.push(error);
          logger.error('doOnKeysValuesMatching: ' + keyMask + ' ' + valueMask + ' e: ' + error,
            error);
        } else {
          if (valueMask === '*' || valueMask === result) {
            action(key, result);
            actionThrown++;
          }
        }
        receivedCount++;
        checkDone();
      });
    }, doOnKeysMatchingDone);
}
exports.doOnKeysValuesMatching = doOnKeysValuesMatching;


//------------------- specific cache logic

//------------------ access management ------------//

exports.setJSONCachedValue = function (key, value, ttl, callback) {
  var multi = redis.multi();
  var dbkey = key;
  multi.set(dbkey, JSON.stringify(value));
  multi.expire(dbkey, ttl);
  multi.exec(function (error, result) {
    if (error) { logger.error('Redis setJSONCachedValue: ' + key +
      ' ' + value + ' e: ' + error, error);
    }
    callback(error, result); // callback anyway
  });
};

exports.getJSONCachedValue = function getJSONCachedValue(key, callback) {
  getJSON(key, callback);
};

