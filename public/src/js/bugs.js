/*
 * debugger.io: An interactive web scripting sandbox
 *
 * bugs.js: bug actions
 */

define([
  'config', 'utils', 'jquery', 'underscore',
  'backbone', 'flash', 'frame', 'mirrors', 'popups'
],
function(
  config, utils, $, _, Backbone, flash, frame, mirrors, popups
) {
  'use strict';

  var bugs = utils.module('bugs');

  var current_bug;


  bugs.Bug = Backbone.Model.extend({
    idAttribute: 'slug',

    _url: '/api/bugs/',
    url: function() {
      return this._url + this.get('_' + this.idAttribute);
    }
  });

  bugs.BugView = Backbone.View.extend({

  });




  /**
   * Get a bug from the server matching a username and slug
   *
   * @param {String} username - username for a bug
   * @param {String} bugslug - slug id for a bug
   */
  bugs.get_by_slug = function(username, bugslug) {
    username = username || '';
    bugslug = _.slugify(bugslug);

    var uri = username ?
      _.sprintf('/api/users/%s/bugs/%s', username, bugslug) :
      _.sprintf('/api/bugs/%s', bugslug);

    return $.get(uri);
  };

  /**
   * Display a Bug
   *
   * @param {Object} bug - Bug map
   */
  bugs.display = function(bug) {
    _.each(bug.map, function(value, key) {
      mirrors.set_mode(key, value.mode);
      mirrors.set_content(key, value.content);
    });

    current_bug = bug;
    if (bug.autorun) { _.defer(frame.update); }
  };

  /**
   * Get a get bug from the server and display it
   *
   * @param {String} username - username for a bug
   * @param {String} bugslug - slug id for a bug
   */
  bugs.display_by_slug = function(username, bugslug) {
    bugs.get_by_slug(username, bugslug)
    .done(bugs.display)
    .fail(function(xhr) {
      flash.locale_message_bad(xhr.responseJSON);
    });
  };

  /**
   * Save the currently displayed bug
   *
   * @return {Promise}
   */
  bugs.save = function() {
    return popups.popup('input', 'bug_name_pick', [
      { name: 'title', placeholder: 'bug_title', copy_to: 'bug' },
      { name: 'bug', placeholder: 'url_slug', filter: _.slugify }
    ]).done(function(result) {
      console.log(result);
    });
  };

  return bugs;
});
