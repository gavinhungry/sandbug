/*
 * debugger.io: An interactive web scripting sandbox
 *
 * bugs.js: bug actions
 */

define([
  'config', 'utils', 'jquery', 'underscore'
],
function(
  config, utils, $, _
) {
  'use strict';

  var bugs = utils.module('bugs');

  /**
   *
   */
  bugs.get_bug_by_slug = function(username, bugslug) {
    username = username || '';
    bugslug = _.slugify(bugslug);

    var uri = _.sprintf('/api/users/%s/bugs/%s', username, bugslug);

    $.get(uri).done(function(bug) {

      console.log(bug);

    }).fail(function(err) {

      console.error(err);

    });
  };

  return bugs;
});
