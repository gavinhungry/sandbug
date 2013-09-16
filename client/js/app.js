/*
 * jsbyte: An interactive JS/HTML/CSS environment
 */

define([
  'jquery', 'underscore', 'backbone', 'templates', 'dom', 'config', 'utils',
  'keys', 'panels', 'mirrors'
],
function($, _, Backbone, templates, dom, config, utils, keys, panels, mirrors) {
  'use strict';

  var jsbyte = utils.module('jsbyte');

  jsbyte.App = Backbone.View.extend({
    template: 'app',
    el: '#jsbyte',

    initialize: function() {
      this.render();
      this.init_keys();
    },

    events: {
      'click #github': function(e) { window.open(config.github); }
    },

    // submit byte to the echo server
    run: function() {
      this.$input.submit();
    },

    init_keys: function() {
      var that = this;

      keys.register_handler({ ctrl: true, key: 'enter'}, function(e) {
        that.run();
      });

      keys.init();
    },

    render: function() {
      templates.get(this.template, function(template) {

        var html = _.template(template, { frame: config.frame });
        this.$el.html(html);

        // cache elements to the Backbone View
        dom.cache(this, this.$el, {
          'by_id': ['markup', 'style', 'script', 'input', 'output'],
          'by_class': ['panel']
        });

        // init CodeMirror and resizable panels
        mirrors.init_mirrors(this.$panels.not('iframe').children('textarea'));
        panels.init_panels(this.$panels);

        // ready: remove the loading overlay
        _.delay(function() {
          $('#loading').transition({ 'opacity': '0' }, 500, function() {
            $(this).remove();
          });
        }, config.debug ? 0 : 1000);

      }, this);
    }
  });

  return jsbyte;
});
