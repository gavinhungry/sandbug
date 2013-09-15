/*
 * jsbyte: An interactive JS/HTML/CSS environment
 */

define([
  'jquery', 'underscore', 'backbone', 'templates', 'dom', 'config', 'utils',
  'keys', 'panels'
],
function($, _, Backbone, templates, dom, config, utils, keys, panels) {
  'use strict';

  var jsbyte = utils.module('jsbyte');

  jsbyte.App = Backbone.View.extend({
    template: 'app',
    el: '#jsbyte',


    initialize: function() {
      this.render();
      this.init_keys();
    },


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

        dom.cache(this, this.$el, {
          'by_id': ['markup', 'style', 'script', 'input', 'output'],
          'by_class': ['panel']
        });

        panels.resizable(this.$panels);

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
