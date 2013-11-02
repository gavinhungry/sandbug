/*
 * debugger.io: An interactive web scripting sandbox
 *
 * popup.js: template-able popup windows
 */

define([
  'config', 'utils', 'jquery', 'underscore',
  'bus', 'templates'
],
function(config, utils, $, _, bus, templates) {
  'use strict';

  var popups = utils.module('popups');

  /**
   *
   */
  popups.Popup = Backbone.Model.extend({});

  /**
   *
   */
  popups.PopupView = Backbone.View.extend({
    el: '#popup',

    initialize: function(options) {
      this.render();
    },

    events: {},

    render: function() {
      var popup_promise = templates.get('popup', this);
      var content_promise = templates.get(this.template, this);
      var template_fns = $.when(popup_promise, content_promise);

      template_fns.done(function(popup_fn, content_fn) {
        var that = _.first(utils.ensure_array(this));

        var contentHtml = content_fn(data);
        var popupHtml = popup_fn({ content: contentHtml });

        // remove any existing popups first
        that.$el.transition({ 'opacity': 0 }, 'fast', function() {
          that.$el.html(popupHtml);
        });
      }).fail(function(err) {
        var that = _.first(utils.ensure_array(this));
        var msg = _.sprintf('Error rendering "%s" - %s', that.template, err);
        console.error(msg);
      });

      return this;
    }
  });

  /**
   *
   */
  popups.LoginPopup = popups.Popup.extend({});

  /**
   *
   */
  popups.LoginPopupView = popups.PopupView.extend({
    template: 'login'
  });

  /**
   *
   */
  popups.show = function(name) {
    var modelName = _.sprintf('%sPopup', _.capitalize(_.camelize(name)));
    var viewName = _.sprintf('%sView', modelName);

    var modelConstructor = popups[modelName];
    var viewConstructor = popups[viewName];

    if (!modelConstructor || !viewConstructor) {
      console.error('popups.%s / popups.%s do not exist', modelName, viewName);
      return;
    }

    var model = new modelConstructor();
    var view = new viewConstructor({ model: model });
  };

  return popups;
});
