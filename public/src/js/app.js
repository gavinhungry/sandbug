/*
 * sandbug: An interactive web scripting sandbox
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
  var popups    = require('popups');
  var router    = require('router');
  var templates = require('templates');
  var themes    = require('themes');
  var toolbar   = require('toolbar');

  // ---

  var app = utils.module('app');

  app.App = Backbone.View.extend({
    template: 'app',
    el: '#sandbug',

    initialize: function() {
      app.console.log('init app module');

      var that = this;

      bus.on('user:login', function(username) {
        config.username = username;
        flash.message_good(locales.string('logged_in', username),
          '@logged_in_msg');
      });

      bus.on('user:logout', function() {
        config.username = null;
        flash.message('@logged_out', '@logged_out_msg');
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

      bus.on('config:patch', function(patch) {
        that.$patch.toggleClass('checked', patch);
      });

      bus.on('mirrors:mode mirrors:content bugs:saved', function(panel) {
        _.defer(function() {
          that.$save.prop('disabled', !bugs.dirty());
        });
      });

      this.render().done(function() {
        bus.trigger('init', that);

        that.register_keys();
        that.reveal();
      });

      window.onbeforeunload = function() {
        if (bugs.dirty() && !bugs.empty()) {
          return locales.sync('onbeforeunload');
        }
      };
    },

    events: {
      'click #run': 'run',
      'click #save': 'save',
      'click #save_as': 'save_as',
      'click #properties': 'properties',
      'click #auto': function(e) { config.autorun = !config.autorun; },
      'click #patch': function(e) { config.patch = !config.patch; }
    },

    // submit bug to the frame server
    run: function() {
      frame.update();
    },

    save: function() {
      bugs.save();
    },

    save_as: function() {
      bugs.save_as();
    },

    properties: function() {
      popups.popup('bug_properties', {
        bug: bugs.model()
      });
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

    reveal: function() {
      var that = this;
      this.trigger('reveal');

      _.delay(function() {
        mirrors.focus('script');

        $('#loading').transition({ 'opacity': '0' }, 'fast', function() {
          $(this).remove();
        });
      }, config.splash_delay);

      this.$edit_title.on('click', function(e) {
        that.$title.selectText();
      });
    },

    render: function() {
      return templates.get(this.template, this).then(function(template_fn) {
        var html = template_fn({
          frame: config.frame,
          mode: config.mode
        });

        this.$el.html(html);

        // cache elements to the Backbone View
        dom.cache(this, this.$el, {
          by_id: [
            'title', 'edit-title', 'markup', 'style', 'script', 'input',
            'output', 'save', 'save_as', 'auto', 'patch', 'properties'
          ],
          by_class: ['panel', 'input-panel', 'panel-options']
        });

        this.$iframe = this.$output.children('iframe');
        this.$auto.prop('checked', config.autorun);
        this.$patch.prop('checked', config.patch);

        dom.dropdown(this.$el.find('.dropdown-button'));

        return this.trigger('render');
      });
    }
  });

  return app;
});
