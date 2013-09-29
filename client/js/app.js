/*
 * jsbyte: An interactive JS/HTML/CSS environment
 */

define([
  'config', 'utils', 'jquery', 'underscore',
  'backbone', 'cdn', 'dom', 'keys', 'mirrors', 'panels', 'templates'
],
function(
  config, utils, $, _,
  Backbone, cdn, dom, keys, mirrors, panels, templates
) {
  'use strict';

  var jsbyte = utils.module('jsbyte');

  jsbyte.App = Backbone.View.extend({
    template: 'app',
    el: '#jsbyte',

    initialize: function() {
      var that = this;

      // fetch the CDN package cache right away
      cdn.update_cache();

      this.render(function() {
        // init various components
        mirrors.init(this.$inputPanels.children('textarea'));
        panels.init(this.$panels);
        cdn.init_filter();

        this.register_keys();
        this.remove_splash();
      });
    },

    events: {
      'click #github': function(e) { window.open(config.github); }
    },

    // submit byte to the frame server
    run: function() {
      this.$input.submit();
    },

    register_keys: function() {
      var that = this;

      keys.register_handler({ ctrl: true, key: 'enter' }, function(e) {
        that.run();
      });

      // don't submit anything on input return
      this.$inputPanels.find('input').on('keypress keydown keyup', function(e) {
        if (e.keyCode === keys.key_code_for('enter')) { e.preventDefault(); }
      });

      this.$inputPanels.find('button').on('click', function(e) {
        e.preventDefault();
      });

      keys.init();
    },

    remove_splash: function() {
      var that = this;
      _.delay(function() {
        $('#loading').transition({ 'opacity': '0' }, 500, function() {
          $(this).remove();

          that.$title.children('.text').transition({ 'opacity': 1 }, 'slow');
        });
      }, config.debug ? 0 : 1000);
    },

    render: function(callback) {
      templates.get(this.template, function(template) {
        var html = _.template(template, { frame: config.frame });
        this.$el.html(html);

        // cache elements to the Backbone View
        dom.cache(this, this.$el, {
          'by_id': ['title', 'markup', 'style', 'script', 'input', 'output'],
          'by_class': ['panel']
        });

        this.$inputPanels = this.$panels.not('iframe');

        if (_.isFunction(callback)) { callback.call(this); }
      }, this);

      return this;
    }
  });

  return jsbyte;
});
