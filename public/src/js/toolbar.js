/*
 * debugger.io: An interactive web scripting sandbox
 *
 * toolbar.js: user toolbar
 */

define([
  'config', 'utils', 'jquery', 'underscore',
  'backbone', 'bus', 'dom', 'flash', 'panels', 'popups', 'templates', 'themes'
],
function(
  config, utils, $, _, Backbone,
  bus, dom, flash, panels, popups, templates, themes
) {
  'use strict';

  var toolbar = utils.module('toolbar');

  var toolbarView;

  bus.once('init', function(av) {
    toolbarView = new toolbar.ToolbarView();

    bus.on('user:login', function(username) {
      toolbarView.destroy().done(function() {
        toolbarView = new toolbar.ToolbarView({ username: username });
      });
    });

    bus.on('user:logout', function() {
      toolbarView.destroy().done(function() {
        toolbarView = new toolbar.ToolbarView({ username: null });
      });
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
      'click #login': function(e) { popups.build('login'); },
      'click #logout': function(e) {
        $.post('/logout', { _csrf: config.csrf }).done(function(data) {
          bus.trigger('user:logout');
        }).fail(function() {
          flash.message_bad(locales.string('logout_error'));
        });
      }
    },

    destroy: function() {
      var d = $.Deferred();

      var that = this;
      this.$el.transition({ opacity: 0 }, function() {
        dom.destroy_view(that);
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
