/*
 * debugger.io: An interactive web scripting sandbox
 */

define([
  'module', 'path', 'config', 'utils', 'underscore', 'q',
  'mongojs'
],
function(
  module, path, config, utils, _, Q,
  mongo
) {
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
   * Get a user from a login
   *
   * To get only enabled users with a password, see `auth.get_user_by_login`
   *
   * @param {String} login - username or password
   * @param {Boolean} [hash] - if true, include the hash property
   * @return {Promise} to return a user or false if no matching user found
   */
  db.get_user_by_login = function(login, hash) {
    var d = Q.defer();
    login = utils.ensure_string(login);

    if (connErr) { d.reject(connErr); }
    else if (!login) { d.resolve(false); }
    else {
      var query = _.include(login, '@') ?
        { email: login } : { username: login };

      users.find(query, function(err, users) {
        if (err) { return d.reject(err); }
        if (users.length !== 1) { return d.resolve(false); }

        var user = _.first(users);
        if (!hash) { delete user.hash; }

        d.resolve(user);
      });
    }

    return d.promise;
  };

  /**
   * Get a user from a MongoDB _id
   *
   * @param {String} id - MongoDB _id
   * @param {Boolean} [hash] - if true, include the hash property
   * @return {Promise} to return a user or false if no matching user found
   */
  db.get_user_by_id = function(id, hash) {
    var d = Q.defer();
    id = utils.ensure_string(id);

    if (connErr) { d.reject(connErr); }
    else if (!id) { d.resolve(false); }
    else {
      users.find({ _id: mongo.ObjectId(id) }, function(err, users) {
        if (err) { return d.reject(err); }
        if (users.length !== 1) { return d.resolve(false); }

        var user = _.first(users);
        if (!hash) { delete user.hash; }

        d.resolve(user);
      });
    }

    return d.promise;
  };

  return db;
});
