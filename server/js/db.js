/*
 * debugger.io: An interactive web scripting sandbox
 */

define(function(require) {
  'use strict';

  var _      = require('underscore');
  var config = require('config');
  var utils  = require('utils');

  var mongo    = require('mongojs');
  var Q        = require('q');

  var module    = require('module');
  var path      = require('path');
  var __dirname = path.dirname(module.uri);

  // ---

  var db = {};

  db.dsn = _.str.sprintf('%s:%s@%s:%s/%s',
    config.db.user, config.db.pass, config.db.host, config.db.port,
    config.db.name);

  // why couldn't you put the bunny back in the box?
  var connErr = null;

  try {
    db.raw = mongo(db.dsn, ['users', 'bugs'], { authMechanism: 'ScramSHA1' });
  } catch(err) {
    connErr = err;
  }

  /**
   * Get a user from a login
   *
   * To get only enabled users with a password, see `auth.get_user_by_login`
   *
   * @param {String} login - username or email
   * @param {Boolean} [hash] - if true, include the hash property
   * @return {Promise} to return a user or false if no matching user found
   */
  db.get_user_by_login = function(login, hash) {
    var d = Q.defer();
    login = utils.ensure_string(login);

    if (connErr) { d.reject(connErr); }
    else if (!login) { d.resolve(false); }
    else {
      var query = _.str.include(login, '@') ?
        { email: login } : { username: login };

      db.raw.users.find(query, function(err, users) {
        if (err) { return d.reject(err); }
        if (users.length !== 1) {
          return d.resolve(false);
        }

        var user = _.first(users);
        if (!hash) { delete user.hash; }

        d.resolve(user);
      });
    }

    return d.promise;
  };

  /**
   * Determine if a username or email already exists
   *
   * @param {String} username - requested username
   * @param {String} email - requested email address
   * @return {Promise} resolves to true if username or email exists
   */
  db.login_exists = function(username, email) {
    var d = Q.defer();

    var username_p = db.get_user_by_login(username);
    var email_p = db.get_user_by_login(email);

    Q.all([username_p, email_p]).then(function(results) {
      d.resolve(!!_.find(results));
    }, d.reject);

    return d.promise;
  };

  /**
   * Create a new user with a hashed password
   *
   * @param {String} username - requested username
   * @param {String} email - requested email address
   * @param {String} hash - password hash
   * @return {Promise} resolves to new user record on success
   */
  db.create_user = function(username, email, hash) {
    var d = Q.defer();

    db.raw.users.insert({
      username: username,
      email: email,
      hash: hash,
      settings: {}
    }, function(err, user) {
      if (user) {
        delete user.hash;
      }

      if (err) {
        d.reject(err);
      } else {
        d.resolve(user);
      }
    });

    return d.promise;
  };

  /**
   * Change the password hash of an existing user
   *
   * @param {String} username
   * @param {String} hash
   * @return {Promise}
   */
  db.change_password_hash = function(username, hash) {
    var d = Q.defer();

    db.raw.users.update({
      username: username
    }, {
      $set: {
        hash: hash
      }
    }, function(err, n) {
      if (err) {
        d.reject(err);
      } else {
        d.resolve(n.nModified > 0);
      }
    });

    return d.promise;
  };

  /**
   * Get a user from a MongoDB _id
   *
   * @param {String} id - MongoDB _id
   * @param {Boolean} [hash] - if true, include the hash property
   * @return {Promise} to return a user, or false if no matching result found
   */
  db.get_user_by_id = function(id, hash) {
    var d = Q.defer();
    id = utils.ensure_string(id);

    var projection = { _id: false, hash: !!hash };

    if (connErr) { d.reject(connErr); }
    else if (!id) { d.resolve(false); }
    else {
      db.raw.users.find({ _id: mongo.ObjectId(id) }, projection, function(err, users) {
        if (err) { return d.reject(err); }
        if (users.length !== 1) { return d.resolve(false); }

        var user = _.first(users);
        d.resolve(user);
      });
    }

    return d.promise;
  };

  return db;
});
