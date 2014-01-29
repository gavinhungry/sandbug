/*
 * debugger.io: An interactive web scripting sandbox
 *
 * popup.js: template-able popup windows
 */

define([
  'config', 'utils', 'jquery', 'underscore',
  'bus', 'dom', 'flash', 'keys', 'locales', 'templates'
],
function(config, utils, $, _, bus, dom, flash, keys, locales, templates) {
  'use strict';

  var popups = utils.module('popups');
  var popupEl = '#popup';
  var popupKeyHander;
  var currentView = null;

  /**
   * Base popup Model
   *
   * @param {Boolean} small - mini style popup if true, full-sized if false
   * @param {String} title - Popup heading
   */
  popups.Popup = Backbone.Model.extend({
    defaults: { small: false, title: null }
  });

  /**
   * Base popup View
   */
  popups.PopupView = Backbone.View.extend({
    el: popupEl,

    initialize: function(options) {
      var that = this;
      _.extend(this, _.pick(options, 'template', 'post_render'));

      this.render();

      popupKeyHander =
        keys.register_handler({ key: 'esc' }, function(e) { that.destroy(); });
    },

    events: {
      'submit form': function(e) {
        e.preventDefault();
        this.trigger('submit');
      },

      'click': function(e) {
        // only destroy the popup if the background area is clicked
        if ($(e.target).is(popupEl)) { this.destroy(); }
      },

      // destroy a popup when the cancel button is pressed
      'click .popup-cancel': function(e) { e.preventDefault(); this.destroy(); }
    },

    destroy: function() {
      var d = $.Deferred();

      var that = this;
      keys.unregister_handler(popupKeyHander);

      var data = this.model.toJSON();
      if (data.route) { bus.trigger('navigate', 'back'); }

      popups.hide().always(function() {
        dom.destroy_view(that);
        currentView = null;
        d.resolve(true);
      });

      return d.promise();
    },

    render: function() {
      currentView = this;

      var that = this;
      var data = this.model.toJSON();

      var popup_p = templates.get('popup', this);
      var content_p = templates.get(this.template, this);
      var title_p = locales.string(data.title);

      $.when(popup_p, content_p, title_p)
      .done(function(popup_fn, content_fn, title) {
        var that = _.first(utils.ensure_array(this));

        var contentHtml = content_fn({ data: data });
        var popupHtml = popup_fn({
          small: !!data.small,
          title: title,
          content: contentHtml,
          name: _.sprintf('%s-outer', that.template)
        });

        // remove any existing popups first
        popups.hide().done(function() {
          that.$el.html(popupHtml);
          popups.show().done(function() {
            if (_.isFunction(that.post_transition)) { that.post_transition(); }
          });

          that.$el.find('input:not([type=hidden])').first().focus();

          if (_.isFunction(that.post_render)) { that.post_render(); }
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
   * Login popup
   */
  popups.LoginPopup = popups.Popup.extend({
    defaults: { route: true, small: true, title: 'login' }
  });

  popups.LoginPopupView = popups.PopupView.extend({
    template: 'popup-login',

    initialize: function(options) {
      this.events = _.extend({}, this.events, this._events);
      this.constructor.__super__.initialize.apply(this, arguments);
    },

    _events: {
      'submit #login_form': function(e) {
        var that = this;

        utils.submit_form($(e.target)).done(function(username) {
          bus.trigger('user:login', username);
          that.destroy();
        }).fail(function() {
          that.show_invalid_login(); // invalid credentials
        });
      }
    },

    post_render: function() {
      dom.cache(this, this.$el, { 'by_name': ['username', 'password'] });
    },

    show_invalid_login: function() {
      this.$el.find('input[name="password"]').select();
      flash.message_bad(locales.string('invalid_creds'),
        locales.string('invalid_creds_msg'));
    }
  });

  /**
   * Sign Up popup
   */
  popups.SignupPopup = popups.Popup.extend({
    defaults: { route: true, small: true, title: 'create_account' }
  });

  popups.SignupPopupView = popups.PopupView.extend({
    template: 'popup-signup',

    initialize: function(options) {
      this.events = _.extend({}, this.events, this._events);
      this.constructor.__super__.initialize.apply(this, arguments);
    },

    _events: {
      'submit #signup_form': function(e) {
        var that = this;

        if (this.$username.val().length < 3) {
          return flash.message_bad(locales.string('invalid_username'),
            locales.string('invalid_username_msg'));
        }

        if (this.$email.is(':invalid') || !this.$email.val()) {
          return flash.message_bad(locales.string('invalid_email'));
        }

        if (this.$password.val() !== this.$confirm.val()) {
          return flash.message_bad(locales.string('password_mismatch'));
        }

        if (this.$password.val().length < 8) {
          return flash.message_bad(locales.string('invalid_password'),
            locales.string('invalid_password_msg'));
        }

        utils.submit_form($(e.target)).done(function(username) {
          bus.trigger('user:login', username);
          that.destroy();
        }).fail(function(xhr) {
          flash.locale_message_bad(xhr.responseJSON);
       });
      }
    },

    post_render: function() {
      dom.cache(this, this.$el, {
        'by_name': ['username', 'email', 'password', 'confirm']
      });
    }
  });

  /**
   * Build a popup and show it right away
   *
   * @param {String} name - name of the popup template to use
   * @return {Promise} to resolve to a map of the submitted form
   */
  popups.popup = function(name) {
    var d = $.Deferred();

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

    view.on('destroy', d.reject);

    view.on('submit', function() {
      var $form = view.$el.find('form');

      var serial = _.compact($form.serialize().split('&'));
      var list = _.map(serial, function(token) { return token.split('='); });
      var map = _.object(list);

      _.each(_.keys(map), function(prop) {
        if (_.first(prop) === '_') { delete map[prop]; }
      });

      d.resolve(map);
    });

    return d.promise();
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
      $popup.removeClass('nopointer');
      $popup.css({ 'display': 'block' }).transition({
        'opacity': 1,
        'margin-top': '1em'
      }, function() { d.resolve(true); });
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
        $popup.addClass('nopointer');
        $popup.transition({ 'opacity': 0, 'margin-top': 0 }, function() {
          $popup.css({ 'display': 'none' });
          d.resolve(true);
        });
      }
    }

    return d.promise();
  };

  /**
   * Destroy the currently visible popup(s)
   *
   * @return {Promise}
   */
  popups.destroy = function() {
    return currentView instanceof popups.PopupView ?
      currentView.destroy() : utils.resolve_now(true);
  };

  /**
   * Get input from the user (single text input)
   *
   * @return {Promise} to return the value of an input field
   */
  popups.get_user_input = function(options) {
    var d = $.Deferred();
    options = options || {};

    var model = new popups.Popup(_.extend({
      route: false,
      small: true,
      placeholder: options.placeholder
    }, options));

    popups.destroy().done(function() {
      var $input;

      var view = new popups.PopupView({
        model: model,
        template: 'popup-input',
        post_render: function() {
          $input = this.$el.find('input:not([type=hidden])').first();
          $input.on('input', function() {
            var $this = $(this);
            var start = this.selectionStart, end = this.selectionEnd;

            if (_.isFunction(options.filter)) {
              var val = options.filter($this.val());
              $this.val(val);
            }

            this.setSelectionRange(start, end);
          });
        }
      });

      view.on('submit', function() {
        var result = $input.val();
        view.destroy();
        d.resolve(result);
      });
    });

    return d.promise();
  };

  return popups;
});
