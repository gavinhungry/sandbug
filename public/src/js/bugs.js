/*
 * debugger.io: An interactive web scripting sandbox
 *
 * bugs.js: bug actions
 */

define([
  'config', 'utils', 'jquery', 'underscore',
  'backbone', 'bus', 'flash', 'frame', 'mirrors', 'popups'
],
function(
  config, utils, $, _, Backbone, bus, flash, frame, mirrors, popups
) {
  'use strict';

  var bugs = utils.module('bugs');

  bus.init(function(av) {
    bugs._priv.current = {};

    bus.on('mirrors:mode', function(panel, mode, label) {
      // deep-model
    });
  });

  /**
   *
   */
  bugs.Bug = Backbone.DeepModel.extend({
    idAttribute: 'slug',

    _url: '/api/bugs/',
    url: function() {
      return this._url + this.get(this.idAttribute);
    }
  });

  /**
   *
   */
  bugs.BugView = Backbone.View.extend({
    render: function() {
      var props = this.model.toJSON();

      _.each(props.map, function(value, key) {
        mirrors.set_mode(key, value.mode);
        mirrors.set_content(key, value.content);
      });

      if (props.autorun) { _.defer(frame.update); }

      return this;
    }
  });

  /**
   * Get the current bug model
   *
   * @return {bugs.Bug}
   */
  bugs.model = function() {
    if (!(bugs._priv.current.model instanceof bugs.Bug)) {
      bugs._priv.current.model = new bugs.Bug();
    }

    return bugs._priv.current.model;
  };

  /**
   * Get the current bug view
   *
   * @return {bugs.BugView}
   */
  bugs.view = function() {
    if (!(bugs._priv.current.view instanceof bugs.BugView)) {
      bugs._priv.current.view = new bugs.BugView({ model: bugs.model() });
    }

    return bugs._priv.current.view;
  };

  /**
   * Display a Bug
   *
   * @param {bugs.Bug} bug
   */
  bugs.display = function(bug) {
    var props = bug.toJSON();

    bus.trigger('navigate', 'bugs/' + props.slug);

    // destroy previous model
    if (bug !== bugs.model()) { bugs.model().destroy(); }

    var view = new bugs.BugView({ model: bug });

    bugs._priv.current = {
      model: bug,
      view: view
    };

    view.render();
  };

  /**
   * Get a bug from the server matching a slug
   *
   * @param {String} bugslug - slug id for a bug
   * @return {Promise} resolving to {bugs.Bug}
   */
  bugs.get = function(bugslug) {
    var bug = new bugs.Bug({ slug: bugslug });
    return bug.fetch().then(function() {
      return bug;
    }, flash.xhr_error);
  };

  /**
   * Get a bug from the server and display it
   *
   * @param {String} bugslug - slug id for a bug
   * @return {Promise}
   */
  bugs.open = function(bugslug) {
    return bugs.get(bugslug).then(bugs.display);
  };

  /**
   * Save the currently displayed bug
   *
   * @return {Promise}
   */
  bugs.save = function() {
    return popups.popup('input', 'bug_name_pick', [
      { name: 'title', placeholder: 'bug_title', copy_to: 'slug' },
      { name: 'slug', placeholder: 'url_slug', filter: _.slugify }
    ]).done(function(result) {

      bugs.console.log(result);

      // save bugs.model() here (with new slug? need a "Save As"?)
    });
  };

  /**
   * Create a new bug
   */
  bugs.create = function() {

  };

  return bugs;
});
