/*
 * debugger.io: An interactive web scripting sandbox
 */

define([
  'module', 'path', 'config', 'utils', 'underscore', 'q',
  'auth', 'db'
],
function(
  module, path, config, utils, _, Q,
  auth, db
) {
  'use strict';

  var __dirname = path.dirname(module.uri);
  var bugs = {};

  /**
   * Get a bug from a username and slug
   *
   * @param {String} username - username for a bug
   * @param {String} bugslug - slug id for a bug
   * @return {Promise} to return a bug, or false if no matching result found
   */
  bugs.get_by_slug = function(username, bugslug) {
    username = auth.sanitize_username(username);
    bugslug = _.slugify(bugslug);

    return db.get_bug_by_slug(username, bugslug);
  };

  return bugs;
});
