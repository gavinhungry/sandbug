/*
 * jsbyte: An interactive JS/HTML/CSS environment
 */

define([
  'jquery', 'underscore', 'backbone', 'templates', 'dom', 'config',
  'utils'
],
function($, _, Backbone, templates, dom, config, utils) {
  'use strict';

  var JSByte = utils.module('JSByte');

  JSByte.App = Backbone.View.extend({
    template: 'app',
    el: '#jsbyte',

    initialize: function() {
      this.render();
    },

    events: {
      'click #run': 'run'
    },

    run: function(e) {
      this.$input.submit();
    },

    render: function() {
      templates.get(this.template, function(template) {
        var html = _.template(template, { frame: config.frame });
        this.$el.html(html);

        dom.backbone_cache(this, {
          'by_id': ['markup', 'style', 'script', 'input', 'output', 'run']
        });

      }, this);
    }
  });

  return JSByte;
});
