/*
 * debugger.io: An interactive web scripting sandbox
 */

define([
  'module', 'path', 'config', 'utils', 'underscore', 'q',
  'bcrypt-nodejs', 'body-parser', 'cookie-parser', 'cookie-session', 'csurf',
  'db', 'express', 'passport', 'passport-local', 'validator'
],
function(
  module, path, config, utils, _, Q,
  bcrypt, bodyParser, cookieParser, cookieSession, csurf, db, express, passport,
  local, validator
) {
  'use strict';

  var __dirname = path.dirname(module.uri);
  var auth = {};

  /**
   * @param {Express} server - Express server to init auth methods on
   */
  auth.init = function(server) {
    passport.serializeUser(function(user, done) {
      var timestamp = utils.timestamp_now();
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
          user ? done(null, user) : done(null, false, { msg: 'invalid login' });
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

    server.use(bodyParser.json());
    server.use(bodyParser.urlencoded({ extended: true }));
    server.use(cookieParser());
    server.use(cookieSession({
      secret: config.auth.secret,
      key: config.auth.cookie
    }));

    server.use(passport.initialize());
    server.use(passport.session());
    server.use(csurf());
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
   * @param {String} login - username or email
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
    }, d.reject);

    return d.promise;
  };

  /**
   * Create a new user with a plaintext password
   *
   * @param {String} username - requested username
   * @param {String} email - requested email address
   * @param {String} plaintext - plaintext password
   * @param {String} confirm - plaintext password confirmation
   * @return {Promise} resolves to new user record on success
   */
  auth.create_user = function(username, email, plaintext, confirm) {
    var d = Q.defer();

    username = _.clean(username);
    email = _.clean(email);

    if (!auth.is_valid_username(username)) {
      return utils.reject_now(new utils.LocaleMsg('invalid_username'));
    }

    if (!auth.is_valid_email(email)) {
      return utils.reject_now(new utils.LocaleMsg('invalid_email'));
    }

    if (plaintext !== confirm) {
      return utils.reject_now(new utils.LocaleMsg('password_mismatch'));
    }

    if (!auth.is_valid_password(plaintext)) {
      return utils.reject_now(new utils.LocaleMsg('invalid_password'));
    }

    // check that the login is available first
    db.login_exists(username, email).then(function(exists) {
      if (exists) { return d.reject(new utils.LocaleMsg('user_exists')); }

      // get a hash for the plaintext password
      auth.generate_hash(plaintext).then(function(hash) {
        // actually create the user
        db.create_user(username, email, hash).then(function(user) {

          // success! resolve to this new user record
          d.resolve(user);

        }, d.reject);
      }, d.reject);
    }, d.reject);

    return d.promise;
  };

  /**
   * Determine if a session timestamp is expired
   *
   * @param {Number | String} timestamp - a Unix timestamp
   * @return {Boolean} true if timestamp is expired, false otherwise
   */
  auth.timestamp_is_expired = function(timestamp) {
    var max = config.auth.hours * 3600;
    var age = utils.timestamp_age(timestamp);

    return age < 0 || age > max;
  };

  /**
   * Clean up a potential username string
   *
   * @param {String} username - a string to treat as username input
   * @return {String} username with only alphanumeric characters and underscores
   */
  auth.sanitize_username = function(username) {
    username = utils.ensure_string(username).toLowerCase();
    return username.replace(/[^a-z0-9_]/ig, '');
  };

  /**
   * Test for a valid username
   *
   * @param {String} username - a string to treat as username input
   * @return {Boolean} true if username is valid, false otherwise
   */
  auth.is_valid_username = function(username) {
    return auth.sanitize_username(username) ===
      username && username.length >= 3 && username.length <= 64;
  };

  /**
   * Test for a valid email address
   *
   * @param {String} email - a string to treat as email address input
   * @return {Boolean} true if email is valid, false otherwise
   */
  auth.is_valid_email = function(email) {
    return validator.isEmail(email);
  };

  /**
   * Test for a valid password
   *
   * The only requirements for a valid password are that it must contain at
   * least one non-whitespace character, be at least 8 characters and at most
   * 1024 characters.  Users are free to shoot themselves in the foot.
   *
   * @param {String} plaintext - a string to treat as password input
   * @return {Boolean} true if password is valid, false otherwise
   */
  auth.is_valid_password = function(plaintext) {
    return _.isString(plaintext) && /^(?=.*\S).{8,1024}$/.test(plaintext);
  };

  return auth;
});
