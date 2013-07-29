/*
 * jsbyte: An interactive JS/HTML/CSS environment
 */

define([
  'jquery', 'underscore', 'backbone', 'templates', 'frame', 'dom', 'config',
  'utils'
],
function($, _, Backbone, templates, frame, dom, config, utils) {
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
      var markup = this.$markup.val();
      var script = this.$script.val();
      var style = this.$style.val();

      var $frame = frame.build_frame(markup);
      this.$output.empty().append($frame);
    },

    render: function() {
      templates.get(this.template, function(template) {
        // no data to pass to template yet
        var html = _.template(template);
        this.$el.html(html);

        dom.backbone_cache(this, {
          'by_id': ['markup', 'script', 'style', 'output', 'run']
        });

      }, this);
    }
  });

  return JSByte;
});
