/*
 * debugger.io: An interactive web scripting sandbox
 */

define([
  'module', 'path', 'config', 'utils', 'us', 'q',
  'bcrypt-nodejs', 'db', 'express', 'passport', 'passport-local'
],
function(
  module, path, config, utils, _, Q,
  bcrypt, db, express, passport, local
) {
  'use strict';

  var __dirname = path.dirname(module.uri);
  var auth = {};

  /**
   * @param {Express} server - Express server to init auth methods on
   */
  auth.init = function(server) {
    passport.serializeUser(function(user, done) {
      var timestamp = new Date().getTime();
      var str = _.sprintf('%s-%s', timestamp, user._id);

      done(null, str);
    });

    passport.deserializeUser(function(str, done) {
      var split = utils.ensure_string(str).split('-');
      var timestamp = _.first(split);
      var id = _.last(split);

      if (auth.timestamp_is_expired(timestamp)) {
        done(null, false, { msg: 'session expired' });
      } else {

        // find a user for this session
        db.get_user_by_id(id, false).then(function(user) {
          user ? done(null, user) : done(null, false, { msg: 'invalid user id' });
        }, function(err) {
          done(err, false, { msg: 'authentication error' });
        });
      }
    });

    passport.use(new local.Strategy(function(login, plaintext, done) {
      auth.get_user_by_login(login, plaintext).then(function(user) {
        user ? done(null, user) : done(null, false, { msg: 'invalid login' });
      }, function(err) {
        done(err, false, { msg: 'authentication error' });
      });
    }));

    server.use(express.cookieParser());
    server.use(express.cookieSession({
      secret: config.auth.secret,
      key: config.auth.cookie
    }));

    server.use(passport.initialize());
    server.use(passport.session());
  };

  auth.authenticate = passport.authenticate('local');

  /**
   * Generate a bcrypt salted hash from a plaintext string
   *
   * @param {String} plaintext - password to hash
   * @return {Promise} to return salted hash
   */
  auth.generate_hash = function(plaintext) {
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
  auth.verify_hash = function(plaintext, hash) {
    var d = Q.defer();

    if (!_.isString(plaintext) || !plaintext.length) { d.resolve(false); }
    else {
      bcrypt.compare(plaintext, hash, function(err, result) {
        d.resolve(!err && !!result);
      });
    }

    return d.promise;
  };

  /**
   * Get a user from a login and plaintext password
   *
   * @param {String} login - username or password
   * @param {String} plaintext - password to check
   * @return {Promise} to return a user or false if no matching user found
   */
  auth.get_user_by_login = function(login, plaintext) {
    var d = Q.defer();

    db.get_user_by_login(login, true).then(function(user) {
      if (!user || user.disabled) { d.resolve(false); }

      auth.verify_hash(plaintext, user.hash).done(function(match) {
        delete user.hash;
        match ? d.resolve(user) : d.resolve(false);
      });
    }, function(err) {
      d.reject(err);
    });

    return d.promise;
  };

  /**
   * Determine if a session timestamp is expired
   *
   * @param {Number | String} timestamp - a Unix timestamp
   * @return {Boolean} true if timestamp is expired, false otherwise
   */
  auth.timestamp_is_expired = function(timestamp) {
    var max = config.auth.hours * 3600 * 1000;
    var age = utils.timestamp_age(timestamp);

    return age < 0 || age > max;
  };

  return auth;
});
