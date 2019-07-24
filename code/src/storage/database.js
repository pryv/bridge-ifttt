// @flow

//handle the database
const logger = require('winston');
const config = require('../utils/config');
const redis = require('redis').createClient(config.get('redis:port'));
const async = require('async');
const semver = require('semver');

//redis error management
/**
 redis.on('error', function (err) {
  logger.error('Redis: ' + err.message);
});     **/

const LASTEST_DB_VERSION: string = '0.0.1';
const DBVERSION_KEY: string = 'dbversion';
let dbversion: string = '';

const connectionChecked = require('readyness').waitFor('database');


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
  });
}


/**
 * simply map redis.set
 */
exports.set = function (key: string, callback: () => {}) {
  redis.set(key, callback);
};

/**
 * simply map redis.get
 */
exports.get = function (key: string, callback: () => {}) {
  redis.get(key, callback);
};

/**
 * simply map redis.hgetall
 */
exports.getSet = function (key: string, callback: () => {}) {
  redis.hgetall(key, callback);
};

/**
 * simply map redis.hmset
 */
exports.setSet = function (key: string, value: {}, callback: () => {}) {
  redis.hmset(key, value, callback);
};


exports.getJSON = function(key: string, callback: () => {}) {
  redis.get(key, function (error: {}, result: string) {
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




/**
 * "search into keys"
 * @param keyMask  '*:...'
 * @param action function (key)
 * @param done function (error,count) called when done ..  with the count of "action" sent
 */
exports.doOnKeysMatching = function (keyMask: string, action: (Array<{}>) => {}, done: (err: ?{}, {}) => {}) {

  redis.keys(keyMask, function (error: {}, replies: Array<{}>) {
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
};


/**
 * "search into values "
 * @param keyMask
 * @param valueMask .. a string for now.. TODO a regexp
 * @param done function (error, result_count) called when done ..
 */
exports.doOnKeysValuesMatching = function(keyMask, valueMask, action, done) {

  let receivedCount = 0;
  let actionThrown = 0;
  let waitFor = -1;
  const errors = [];

  function checkDone() {
    if (waitFor > 0 && waitFor === receivedCount) {
      if (done) {
        done(errors.length === 0 ? null : errors, receivedCount);
      }
    }
  }

  function doOnKeysMatchingDone(error, count) {
    waitFor = count;
    checkDone();
  }

  this.doOnKeysMatching(keyMask,
    function (key) {
      redis.get(key, function (error, result) {
        if (error) {
          errors.push(error);
          logger.error('doOnKeysValuesMatching: ' + keyMask + ' ' + valueMask + ' e: ' + error,
            error);
        } else {
          if (valueMask === '*' || valueMask === result) {
            action(key, result);
            actionThrown++;
          }
        }
        receivedCount++;
        checkDone();
      });
    }, doOnKeysMatchingDone);
};


//------------------- specific cache logic

//------------------ access management ------------//

exports.setJSONCachedValue = function (key, value, ttl, callback) {
  const multi = redis.multi();
  const dbkey = key;
  multi.set(dbkey, JSON.stringify(value));
  multi.expire(dbkey, ttl);
  multi.exec(function (error, result) {
    if (error) { logger.error('Redis setJSONCachedValue: ' + key +
      ' ' + value + ' e: ' + error, error);
    }
    callback(error, result); // callback anyway
  });
};

exports.getJSONCachedValue = function (key, callback) {
  this.getJSON(key, callback);
};

