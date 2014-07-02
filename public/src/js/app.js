/*
 * debugger.io: An interactive web scripting sandbox
 */

define(function(require) {
  'use strict';

  var $      = require('jquery');
  var _      = require('underscore');
  var bus    = require('bus');
  var config = require('config');
  var utils  = require('utils');

  var Backbone  = require('backbone');
  var bugs      = require('bugs');
  var cdn       = require('cdn');
  var dom       = require('dom');
  var flash     = require('flash');
  var frame     = require('frame');
  var keys      = require('keys');
  var locales   = require('locales');
  var mirrors   = require('mirrors');
  var panels    = require('panels');
  var router    = require('router');
  var templates = require('templates');
  var themes    = require('themes');
  var toolbar   = require('toolbar');

  // ---

  var app = utils.module('app');

  app.App = Backbone.View.extend({
    template: 'app',
    el: '#debuggerio',

    initialize: function() {
      app.console.log('init app module');

      var that = this;

      bus.on('user:login', function(username) {
        config.username = username;
        flash.message_good(locales.string('logged_in', username),
          '@logged_in_msg');

        that.$save.transitIn();
      });

      bus.on('user:logout', function() {
        config.username = null;
        flash.message('@logged_out', '@logged_out_msg');

        that.$save.transitOut();
      });

      bus.on('config:mode', function(mode) {
        var $body = $('body');
        var modes = _.keys(mode);

        _.each(modes, function(modeClass) {
          $body.toggleClass(modeClass, mode[modeClass]);
        });
      });

      bus.on('config:autorun', function(autorun) {
        that.$auto.toggleClass('checked', autorun);
      });

      this.render(function() {
        bus.trigger('init', this);

        this.register_keys();
        _.delay(_.bind(this.remove_splash, this), config.splash_delay);
      });
    },

    events: {
      'click #run': 'run',
      'click #save': 'save',
      'click #auto': function(e) { config.autorun = !config.autorun; }
    },

    // submit bug to the frame server
    run: function() {
      frame.update();
    },

    save: function() {
      bugs.save();
    },

    register_keys: function() {
      var that = this;

      keys.register_handler({ ctrl: true, key: 'enter' }, function(e) {
        that.run();
      });

      // don't submit anything on input return
      this.$panel_options.find('> input').on('input keydown', function(e) {
        if (e.keyCode === keys.key_code_for('enter')) { e.preventDefault(); }
      });

      this.$panel_options.find('> button').on('click', function(e) {
        e.preventDefault();
      });
    },

    remove_splash: function() {
      var that = this;
      $('#loading').transition({ 'opacity': '0' }, function() {
        $(this).remove();
        that.$title.transition({ 'opacity': 1 }, 'slow', that.welcome);
      });
    },

    // show a welcome message, but just once
    welcome: function() {
      return; // not used

      if (!localStorage.getItem('seen')) {
        localStorage.setItem('seen', true);

        flash.message_good('@welcome', '@welcome_msg', {
          no_timeout: true,
          wide: true
        });
      }
    },

    render: function(callback) {
      templates.get(this.template, this).done(function(template_fn) {
        var html = template_fn({ frame: config.frame });
        this.$el.html(html);

        // cache elements to the Backbone View
        dom.cache(this, this.$el, {
          by_id: [
            'title', 'markup', 'style', 'script', 'input', 'output', 'save',
            'auto'
          ],
          by_class: ['panel', 'input-panel', 'panel-options']
        });

        this.$save[!config.username ? 'transitOut' : 'transitIn']();
        this.$iframe = this.$output.children('iframe');
        this.$auto.prop('checked', config.autorun);

        _.isFunction(callback) && callback.call(this);
      });

      return this;
    }
  });

  return app;
});
