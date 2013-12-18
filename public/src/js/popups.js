/*
 * debugger.io: An interactive web scripting sandbox
 *
 * popup.js: template-able popup windows
 */

define([
  'config', 'utils', 'jquery', 'underscore',
  'bus', 'flash', 'keys', 'templates'
],
function(config, utils, $, _, bus, flash, keys, templates) {
  'use strict';

  var popups = utils.module('popups');
  var popupEl = '#popup';
  var popupKeyHander;

  /**
   *
   */
  popups.Popup = Backbone.Model.extend({
    defaults: { small: false, title: 'Popup' }
  });

  /**
   *
   */
  popups.PopupView = Backbone.View.extend({
    el: popupEl,

    initialize: function(options) {
      var that = this;

      this.render();

      // remove popup on popups:destroy or Escape key
      bus.on('popups:destroy', function() { that.destroy(); }, this);
      popupKeyHander =
        keys.register_handler({ key: 'esc' }, function(e) { that.destroy(); });
    },

    events: {
      'click': function(e) {
        // only destroy the popup if the background area is clicked
        if ($(e.target).is(popupEl)) { this.destroy(); }
      }
    },

    destroy: function() {
      var that = this;
      keys.unregister_handler(popupKeyHander);

      popups.hide().always(function() {
        // View.remove would call $el.remove, we want to reuse it
        that.$el.empty();
        that.stopListening();
        that.undelegateEvents();
        bus.off_for(that);
      });
    },

    render: function() {
      var that = this;

      var popup_p = templates.get('popup', this);
      var content_p = templates.get(this.template, this);
      var template_fns = $.when(popup_p, content_p);

      template_fns.done(function(popup_fn, content_fn) {
        var that = _.first(utils.ensure_array(this));

        var data = that.model.toJSON();

        var contentHtml = content_fn({ data: data });
        var popupHtml = popup_fn({
          small: !!data.small,
          title: data.title,
          content: contentHtml,
          name: _.sprintf('%s-outer', that.template)
        });

        // remove any existing popups first
        popups.hide().done(function() {
          that.$el.html(popupHtml);
          popups.show().done(function() {
            if (_.isFunction(that.post_render)) { that.post_render(); }
          });
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
  popups.LoginPopup = popups.Popup.extend({
    defaults: { small: true, title: 'Login to debugger.io' }
  });

  /**
   *
   */
  popups.LoginPopupView = popups.PopupView.extend({
    template: 'popup-login',

    initialize: function(options) {
      this.events = _.extend({}, this.events, this._events);
      this.constructor.__super__.initialize.apply(this, arguments);
    },

    _events: {
      'submit #login_form': function(e) {
        var that = this;
        e.preventDefault();

        var $form = $(e.target);
        var uri = $form.attr('action');
        var data = $form.serialize();

        var method = $form.attr('method') === 'post' ? 'post' : 'get';
        $[method](uri, data).done(function(username) {

          // logged in
          bus.trigger('user:login', username);
          flash.message_good('Successfully logged in',
            _.sprintf('Welcome back, %s!', username));

          that.destroy();
        }).fail(function() {

          // invalid credentials
          that.show_invalid_login();
        });
      }
    },

    post_render: function() {
      this.$el.find('input[name="username"]').focus();
    },

    show_invalid_login: function() {
      this.$el.find('input[name="password"]').select();
      flash.message_bad('Invalid login credentials');
    }
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
      $popup.show(function() {
        $popup.transition({ 'opacity': 1 }, function() {
          d.resolve(true);
        });
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
      // popup is already hidden, don't wait to resolve
      if ($popup.css('opacity') === '0') { d.resolve(true); }
      else {
        $popup.transition({ 'opacity': 0 }, function() {
          $popup.hide();
          d.resolve(true);
        });
      }
    }

    return d.promise();
  };

  /**
   * Destroy the currently visible popup(s)
   */
  popups.destroy = function() {
    bus.trigger('popups:destroy');
  };

  return popups;
});
