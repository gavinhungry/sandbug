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
  var popupEl = '#popup';

  /**
   *
   */
  popups.Popup = Backbone.Model.extend({});

  /**
   *
   */
  popups.PopupView = Backbone.View.extend({
    el: popupEl,

    initialize: function(options) {
      this.render();
    },

    events: {
      'click': function(e) {
        // only destroy the popup if the background area is clicked
        if ($(e.target).is(popupEl)) { this.destroy(); }
      }
    },

    destroy: function() {
      var that = this;

      popups.hide().always(function() {
        // View.remove would call $el.remove, we want to reuse it
        that.$el.empty();
        that.stopListening();
        // FIXME: need to navigate away now?
      });
    },

    render: function() {
      var popup_promise = templates.get('popup', this);
      var content_promise = templates.get(this.template, this);
      var template_fns = $.when(popup_promise, content_promise);

      template_fns.done(function(popup_fn, content_fn) {
        var that = _.first(utils.ensure_array(this));

        var contentHtml = content_fn({ data: that.model.toJSON() });
        var popupHtml = popup_fn({ content: contentHtml });

        // remove any existing popups first
        popups.hide().done(function() {
          that.$el.html(popupHtml);
          popups.show();
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
    template: 'popup-login'
  });

  /**
   * Build a popup and show it right away
   *
   * @param {String} name - name of the popup template to use
   */
  popups.build = function(name) {
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

  /**
   * Show the currently assigned popup
   *
   * @return {Promise} resolves to true after showing, or rejects to false
   */
  popups.show = function() {
    var d = $.Deferred();

    var $popup = $(popupEl);
    if (!$popup.length || $popup.is(':empty')) { d.reject(false); }
    else {
      $popup.show().transition({ 'opacity': 1 }, function() {
        d.resolve(true);
      });
    }

    return d.promise();
  };

  /**
   * Hide the currently visible popup
   *
   * @return {Promise} resolves to true after hiding, or rejects to false
   */
  popups.hide = function() {
    var d = $.Deferred();

    var $popup = $(popupEl);
    if (!$popup.length) { d.reject(false); }
    else {
      $popup.transition({ 'opacity': 0 }, function() {
        $popup.hide();
        d.resolve(true);
      });
    }

    return d.promise();
  };

  return popups;
});
