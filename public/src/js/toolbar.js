/*
 * debugger.io: An interactive web scripting sandbox
 *
 * toolbar.js: user toolbar
 */

define(function(require) {
  'use strict';

  var $      = require('jquery');
  var _      = require('underscore');
  var bus    = require('bus');
  var config = require('config');
  var utils  = require('utils');

  var Backbone  = require('backbone');
  var com       = require('com');
  var dom       = require('dom');
  var panels    = require('panels');
  var templates = require('templates');
  var themes    = require('themes');
  var user      = require('user');

  // ---

  var toolbar = utils.module('toolbar');

  var toolbarView;

  bus.init(function(av) {
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
      'click #console': function(e) { com.toggle(); },
      'click #theme': function(e) { themes.cycle_theme(); },
      'click #layout': function(e) { panels.cycle_layout(); },
      'click #signup': function(e) { bus.trigger('navigate', 'signup', true); },
      'click #login': function(e) { bus.trigger('navigate', 'login', true); },
      'click #logout': function(e) { user.logout(); }
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

    set_phone_mode: function(phone) {
      this.$layout.toggleClass('hide', phone);
    },

    render: function() {
      return templates.get(this.template, this).then(function(template_fn) {
        var that = this;

        var html = template_fn({ username: this._username });

        this.$el.css({ opacity: 0 }).html(html);

        // cache elements to the Backbone View
        dom.cache(this, this.$el, {
          'by_id': ['theme', 'layout', 'settings', 'logout', 'signup', 'login']
        });

        // hide some controls in phone mode
        this.set_phone_mode(config.mode.phone);
        bus.on('config:mode', function(mode) {
          that.set_phone_mode(mode.phone);
        }, this);

        this.$el.transition({ opacity: 1 });

        return this.trigger('render');
      });
    }
  });

  return toolbar;
});
