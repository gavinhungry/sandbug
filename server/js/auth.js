/*
 * debugger.io: An interactive web scripting sandbox
 */

define([
  'module', 'path', 'config', 'utils', 'us',
  'db', 'passport', 'passport-local'
],
function(module, path, config, utils, _, db, passport, local) {
  'use strict';

  var __dirname = path.dirname(module.uri);
  var auth = {};

  /**
   *
   */
  auth.init = function() {
    passport.serializeUser(function(user, done) {
      var str = new Date().getTime() + '-' + user._id;
      done(null, str);
    });

    passport.deserializeUser(function(id, done) {
      console.log(id);

      // done(err, user);
    });

    passport.use(new local.Strategy(function(login, plaintext, done) {
      db.get_user(login, plaintext).then(function(user) {
        user ? done(null, user) :
          done(null, false, { msg: 'invalid credentials' });
      }, function(err) {
        done(err, false, { msg: 'authentication error' });
      });
    }));
  };

  /**
   *
   */
  auth.authenticate = function() {
    return passport.authenticate('local');
  };

  return auth;
});
