/*
 * debugger.io: An interactive web scripting sandbox
 */

define([
  'module', 'path', 'config', 'utils', 'us',
  'mongojs', 'bcrypt-nodejs', 'q'
],
function(module, path, config, utils, _, mongo, bcrypt, Q) {
  'use strict';

  var __dirname = path.dirname(module.uri);
  var db = {};

  var dsn = _.sprintf('%s:%s@%s:%s/%s',
    config.db.user, config.db.pass, config.db.host, config.db.port,
    config.db.name);

  // why couldn't you put the bunny back in the box?
  var connErr = null;

  try {
    var mdb = mongo(dsn);
    var users = mdb.collection('users');
    var bugs = mdb.collection('bugs');
  } catch(err) {
    connErr = err;
  }

  /**
   * Generate a bcrypt salted hash from a plaintext string
   *
   * @param {String} plaintext - password to hash
   * @return {Promise} to return salted hash
   */
  db.generate_hash = function(plaintext) {
    var d = Q.defer();

    if (!_.isString(plaintext) || !plaintext.length) { d.reject(); }
    else {
      bcrypt.genSalt(null, function(err, salt) {
        if (err) { return d.reject(err); }

        bcrypt.hash(plaintext, salt, null, function(err, hash) {
          if (err) { return d.reject(err); }

          d.resolve(hash);
        });
      });
    }

    return d.promise;
  };

  /**
   * Verify a plaintext with a bcrypt hash
   *
   * @param {String} plaintext - password to check
   * @param {String} hash - bcrypt hash to compare to `plaintext`
   * @return {Promise} to return a boolean (true if hash matches)
   */
  db.verify_hash = function(plaintext, hash) {
    var d = Q.defer();

    bcrypt.compare(plaintext, hash, function(err, result) {
      d.resolve(!err && !!result);
    });

    return d.promise;
  };

  /**
   * Get a user from a login and plaintext password
   *
   * @param {String} login - username or password
   * @param {String} plaintext - password to check
   * @return {Promise} to return a user or false if no matching user found
   */
  db.get_user = function(login, plaintext) {
    var d = Q.defer();

    if (connErr) { d.reject(connErr); }
    else if (!_.isString(login) || !login.length) { d.resolve(false); }
    else {
      var query = _.include(login, '@') ?
        { email: login } : { username: login };

      users.find(query, function(err, users) {
        if (err) { return d.reject(err); }
        if (users.length !== 1) { return d.resolve(false); }

        var user = _.first(users);
        if (user.disabled) { return d.resolve(false); }

        // if there is a single matching user, compare hashes
        db.verify_hash(plaintext, user.bcrypt).done(function(result) {
          delete user.bcrypt;
          result ? d.resolve(user) : d.resolve(false);
        });
      });
    }

    return d.promise;
  };

  /**
   * Determine if login credentials are for a valid user
   *
   * @param {String} login - username or password
   * @param {String} plaintext - password to check
   * @return {Promise} to return a Boolean
   */
  db.is_valid_user = function(login, plaintext) {
    var d = Q.defer();

    db.get_user(login, plaintext).then(function(user) {
      d.resolve(!!user);
    }, function(err) {
      d.resolve(false);
    });

    return d.promise;
  };

  return db;
});
