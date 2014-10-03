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
  var popups    = require('popups');
  var templates = require('templates');
  var themes    = require('themes');
  var user      = require('user');

  // ---

  var toolbar = utils.module('toolbar');

  var toolbarView;

  // console methods to class names
  var consoleLevels = {
    warn: 'warning',
    error: 'danger'
  };

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

    bus.on('config:com', function(current) {
      toolbarView.setConsoleStatus(current);
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
      var that = this;

      this._username = (options ? options.username : null) || config.username;
      this.render();
    },

    events: {
      'click #console': function(e) { com.toggle(); },
      'click #theme': function(e) { themes.cycle_theme(); },
      'click #layout': function(e) { panels.cycle_layout(); },
      'click #settings': function(e) { popups.popup('user_settings'); },
      'click #signup': function(e) { popups.popup('signup'); },
      'click #login': function(e) { user.login(); },
      'click #logout': function(e) { user.logout(); }
    },

    setConsoleStatus: function(status) {
      var classes = _.groupBy(consoleLevels, function(className, statusName) {
          return status === statusName ? 'add' : 'remove';
      });

      var removeClasses = utils.ensure_array(classes.remove).join(' ');
      var addClasses = utils.ensure_array(classes.add).join(' ');

      this.$console.removeClass(removeClasses);
      this.$console.addClass(addClasses);
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
          'by_id': [
            'console', 'theme', 'layout', 'settings', 'logout', 'signup',
            'login'
          ]
        });

        // hide some controls in phone mode
        this.set_phone_mode(config.mode.phone);
        bus.on('config:mode', function(mode) {
          that.set_phone_mode(mode.phone);
        }, this);

        dom.dropdown(this.$el.find('.dropdown-button'));

        this.setConsoleStatus(config.com);
        this.$el.transition({ opacity: 1 });

        return this.trigger('render');
      });
    }
  });

  return toolbar;
});
