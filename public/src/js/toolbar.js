/*
 * debugger.io: An interactive web scripting sandbox
 */

define([
  'config', 'utils', 'jquery', 'underscore',
  'backbone', 'bus', 'dom', 'panels', 'popups', 'templates', 'themes'
],
function(
  config, utils, $, _, Backbone,
  bus, dom, panels, popups, templates, themes
) {
  'use strict';

  var toolbar = utils.module('toolbar');

  var toolbarView;

  bus.once('init', function(av) {
    toolbarView = new toolbar.ToolbarView();

    bus.on('user:login', function(username) {
      toolbarView = new toolbar.ToolbarView({ username: username });
    });
  });

  /**
   * Toolbar view, either logged out or logged in
   *
   * @param {String} [username] - username of current user
   */
  toolbar.ToolbarView = Backbone.View.extend({
    template: 'toolbar',
    el: '#toolbar',

    initialize: function(options) {
      this._username = (options ? options.username : null) || config.username;
      this.render();
    },

    events: {
      'click #theme': function(e) { themes.cycle_theme(); },
      'click #layout': function(e) { panels.cycle_layout(); },
      'click #login': function(e) { popups.build('login'); }
    },

    destroy: function() {
      var d = $.Deferred();

      this.$el.transition({ opacity: 0 }, function() {
        dom.destroy_view(this);
        d.resolve(true);
      });

      return d.promise();
    },

    render: function() {
      templates.get(this.template, this).done(function(template_fn) {
        var html = template_fn({ username: this._username });
        this.$el.css({ opacity: 0 }).html(html).transition({ opacity: 1 });
      });

      return this;
    }
  });

  return toolbar;
});
