/*
 * debugger.io: An interactive web scripting sandbox
 *
 * popup.js: template-able popup windows
 */

define(function(require) {
  'use strict';

  var $      = require('jquery');
  var _      = require('underscore');
  var bus    = require('bus');
  var config = require('config');
  var utils  = require('utils');

  var cdn       = require('cdn');
  var dom       = require('dom');
  var flash     = require('flash');
  var keys      = require('keys');
  var locales   = require('locales');
  var panels    = require('panels');
  var templates = require('templates');
  var themes    = require('themes');
  var user      = require('user');

  // ---

  var popups = utils.module('popups');
  var popupEl = '#popup';
  var popupKeyHander;
  var currentView = null;

  bus.init(function(av) {
    bus.on('popup:login', function() {
      popups.popup('login');
    });
  });

  /**
   * Base popup Model
   *
   * @param {Boolean} small - mini style popup if true, full-sized if false
   * @param {String} title - Popup heading
   */
  popups.Popup = Backbone.Model.extend({
    defaults: {
      small: false,
      title: null
    },

    // array of promises to resolve before model is ready
    pre_ready: [],

    /**
     * Add remote data to model
     *
     * @param {Object} opts - { key: uri }, add data from uri to key on model
     */
    remote_data: function(opts) {
      var that = this;

      var opts_p = _.map(opts, function(uri, key) {
        return $.get(uri).then(function(data) {
          return that.set(key, data);
        }, function(err) {
          flash.message_bad('@server_error', '@server_error_msg');
        });
      });

      this.pre_ready.push($.when.apply(null, opts_p));
    }
  });

  /**
   * Base popup View
   */
  popups.PopupView = Backbone.View.extend({
    el: popupEl,

    initialize: function(options) {
      var that = this;
      _.extend(this, _.pick(options, 'template', 'post_render'));

      $.when.apply(null, this.model.pre_ready)
        .then(function() {
          popups.destroy().then(function() {
            that.render();
          });
        }, function() {
          that.destroy();
        });

      popupKeyHander =
        keys.register_handler({ key: 'esc' }, function(e) { that.destroy(); });
    },

    events: {
      'submit form': function(e) {
        e.preventDefault();
        this.trigger('submit', e.target);
      },

      'mousedown': function(e) {
        // only destroy the popup if the background area is clicked
        this.bg_mousedown = $(e.target).is(popupEl);
      },

      'mouseup': function(e) {
        if ($(e.target).is(popupEl) && this.bg_mousedown) { this.destroy(); }
      },

      // destroy a popup when the cancel button is pressed
      'click .popup-cancel': function(e) {
        e.preventDefault();
        this.destroy();
      }
    },

    destroy: function() {
      var d = $.Deferred();

      var that = this;
      keys.unregister_handler(popupKeyHander);

      this.$el.removeData('type');

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
      var title_p = locales.prefixed(data.title);

      return $.when(popup_p, content_p, title_p)
      .then(function(popup_fn, content_fn, title) {
        var that = _.first(utils.ensure_array(this));

        var contentHtml = content_fn({
          data: data,
          config: _.clone(config)
        });

        var popupHtml = popup_fn({
          small: !!data.small,
          title: title,
          content: contentHtml,
          name: _.str.sprintf('%s-outer', that.template)
        });

        // remove any existing popups first
        popups.hide().done(function() {
          that.$el.html(popupHtml);
          that.$el.data('type', that.template);

          that.$el.find('select').chosen({
            disable_search: true,
            inherit_select_classes: true
          });

          locales.localize_dom_nodes(that.$el).then(function() {
            popups.show().done(function() {
              if (_.isFunction(that.post_transition)) {
                that.post_transition();
              }
            });

            that.$el.find('input:not([type=hidden])').first().focus();

            if (_.isFunction(that.post_render)) { that.post_render(); }
          });
        });

        return that.trigger('render');

      }).fail(function(err) {
        var that = _.first(utils.ensure_array(this));
        var msg = _.str.sprintf('Error rendering "%s": %s', that.template, err);
        popups.console.error(msg);
      });
    }
  });

  /**
   * Login popup
   */
  popups.LoginPopup = popups.Popup.extend({
    defaults: {
      small: true,
      title: '@login'
    }
  });

  popups.LoginPopupView = popups.PopupView.extend({
    template: 'popup-login',

    initialize: function(options) {
      this.events = _.extend({}, this.events, this._events);
      this.constructor.__super__.initialize.apply(this, arguments);

      this.on('submit', function(form) {
        var that = this;
        var $form = $(form);

        utils.submit_form($form).done(function(username) {
          bus.trigger('user:login', username);
          that.destroy();
        }).fail(function() {
          that.show_invalid_login(); // invalid credentials
        });
      });
    },

    post_render: function() {
      dom.cache(this, this.$el, { 'by_name': ['username', 'password'] });
    },

    show_invalid_login: function() {
      this.$el.find('input[name="password"]').select();
      flash.message_bad('@invalid_creds', '@invalid_creds_msg');
    }
  });

  /**
   * Sign Up popup
   */
  popups.SignupPopup = popups.Popup.extend({
    defaults: {
      small: true,
      title: '@create_account'
    }
  });

  popups.SignupPopupView = popups.PopupView.extend({
    template: 'popup-signup',

    initialize: function(options) {
      this.events = _.extend({}, this.events, this._events);
      this.constructor.__super__.initialize.apply(this, arguments);

      this.on('submit', function(form) {
        var that = this;
        var $form = $(form);

        if (this.$username.val().length < 3) {
          return flash.message_bad('@invalid_username', '@invalid_username_msg');
        }

        if (this.$email.is(':invalid') || !this.$email.val()) {
          return flash.message_bad('@invalid_email');
        }

        if (this.$password.val() !== this.$confirm.val()) {
          return flash.message_bad('@password_mismatch');
        }

        if (this.$password.val().length < 8) {
          return flash.message_bad('@invalid_password', '@invalid_password_msg');
        }

        utils.submit_form($form).done(function(username) {
          bus.trigger('user:login', username);
          that.destroy();
        }).fail(function(xhr) {
          flash.locale_message_bad(xhr.responseJSON);
       });
      });
    },

    post_render: function() {
      dom.cache(this, this.$el, {
        'by_name': ['username', 'email', 'password', 'confirm']
      });
    }
  });

  /**
   * User settings popup
   */
  popups.SettingsPopup = popups.Popup.extend({
    defaults: {
      small: true,
      title: '@settings'
    },

    initialize: function() {
      var that = this;

      this.remote_data({
        'locales': '/api/resource/locales'
      });

      var themes_p = locales.strings(themes.get_themes())
      .then(function(themes) {
        return that.set('themes', themes);
      });

      var layouts_p = locales.strings(panels.get_layouts())
      .then(function(layouts) {
        return that.set('layouts', layouts);
      });

      this.pre_ready.push(themes_p);
      this.pre_ready.push(layouts_p);

      this.set('cdns', cdn.get_cdns());
    }
  });

  popups.SettingsPopupView = popups.PopupView.extend({
    template: 'popup-settings',

    initialize: function(options) {
      var that = this;

      this.events = _.extend({}, this.events, this._events);
      this.constructor.__super__.initialize.apply(this, arguments);

      this.on('submit', function(form) {
        var that = this;
        var $form = $(form);

        utils.submit_form($form).done(function() {
          user.get_settings().then(function() {
            that.destroy();
            flash.message_good('@settings_updated');
          });
        }).fail(function(xhr, status, err) {
          switch(xhr.statusCode().status) {
            case 400: flash.message_bad('@settings_invalid'); break;
            default: flash.xhr_error(xhr, status, err);
          }
        });
      });
    },

    post_render: function() {
      dom.cache(this, this.$el, {
        'by_name': ['locales',]
      });
    }
  });

  /**
   * Bug properties popup
   */
  popups.BugPropertiesPopup = popups.Popup.extend({
    defaults: {
      small: true,
      title: '@bug_properties'
    }
  });

  popups.BugPropertiesPopupView = popups.PopupView.extend({
    template: 'popup-bug-properties',

    initialize: function(options) {
      var that = this;

      this.events = _.extend({}, this.events, this._events);
      this.constructor.__super__.initialize.apply(this, arguments);

    }
  });

  /**
   * User prompt
   */
  popups.InputPopup = popups.Popup.extend({
    defaults: {
      small: true,
      title: '@input'
    }
  });

  popups.InputPopupView = popups.PopupView.extend({
    template: 'popup-input',

    initialize: function(options) {
      var that = this;

      this.events = _.extend({}, this.events, this._events);
      this.extras = utils.ensure_array(this.model.get('extras'));

      var placeholder_p = _.map(this.extras, function(extra) {
        return locales.prefixed(extra.placeholder).then(function(placeholder) {
          extra.placeholder = placeholder;
        });
      });

      $.when.apply(null, placeholder_p).done(function() {
        that.constructor.__super__.initialize.apply(that, arguments);
      });

      this.on('submit', function(form) {
        this.destroy();
      });
    },

    post_render: function() {
      var that = this;

      _.each(this.extras, function(extra) {

        var $input = that.$el.find(_.str.sprintf("input[name='%s']", extra.name));

        $input.on('input input-filter', function(e, no_copy) {
          var $this = $(this);
          var filtering = (e.type === 'input-filter');

          // mark manually updated inputs
          if ($this.is(':focus')) { $this.data('touched', true); }

          if (_.isFunction(extra.filter)) {
            var start = this.selectionStart, end = this.selectionEnd;

            var val = extra.filter($this.val());
            $this.val(val);

            if (!filtering) { this.setSelectionRange(start, end); }
          }

          if (extra.copy_to) {
            var $dest = that.$el.find(_.str.sprintf("input[name='%s']", extra.copy_to));
            if (!$dest.val()) { $dest.data('touched', false); }
            if (!$dest.data('touched') && (!no_copy || !$dest.val())) {
              $dest.val($input.val()).trigger('input-filter');
            }
          }
        }).trigger('input-filter', true); // filter existing values right away
      });
    }
  });

  /**
   * Build a popup and show it right away
   *
   * @param {String} name - name of the popup template to use
   * @param {String} title - locale key to use as popup title
   * @param {Object} [extras] - optional data to pass to template
   * @return {Promise} to resolve to a map of the submitted form
   */
  popups.popup = function(name, title, extras) {
    var d = $.Deferred();

    var modelName = _.str.sprintf('%sPopup', _.str.capitalize(_.str.camelize(name)));
    var viewName = _.str.sprintf('%sView', modelName);

    var ModelConstructor = popups[modelName];
    var ViewConstructor = popups[viewName];

    if (!ModelConstructor || !ViewConstructor) {
      popups.console.error(_.str.sprintf('popups.%s or popups.%s not found', modelName, viewName));
      return utils.reject();
    }

    var model = new ModelConstructor();
    if (title) { model.set('title', title); }
    model.set('extras', extras);

    var view = new ViewConstructor({ model: model });

    view.on('destroy', d.reject);

    view.on('submit', function(form) {
      var $form = $(form);

      var map = _.chain($form.serialize().split('&')).map(function(token) {
        return _.map(token.split('='), function(str) {
          return decodeURIComponent(str.replace(/\+/g, ' '));
        });
      }).object().value();

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
   * @return {Promise} resolves after showing, or rejects on failure
   */
  popups.show = function() {
    var $popup = $(popupEl);
    if (!$popup.length || $popup.is(':empty')) {
      return utils.reject();
    }

    $popup.removeClass('nopointer');
    $popup.css({ 'display': 'block' });

    var $inner = $popup.find('.popup');
    var $wrap = $popup.find('.popup-wrap');
    var $bar = $popup.find('.popup-actionbar');
    var offset = $bar.offset().top - ($wrap.offset().top + $wrap.outerHeight());
    $wrap.css('margin-bottom', _.str.sprintf('-%spx', offset));

    return dom.multi_transition([
      { el: $popup, args: { 'opacity': 1 } },
      { el: $inner, args: { 'margin-top': '1em' } }
    ]);
  };

  /**
   * Hide the currently visible popup
   *
   * @return {Promise} resolves after hiding, or rejects on failure
   */
  popups.hide = function() {
    var d = $.Deferred();

    var $popup = $(popupEl);
    if (!$popup.length) {
      return utils.reject();
    }

    // popup is already hidden, don't wait to resolve
    if ($popup.css('opacity') === '0') {
      return utils.resolve();
    }

    $popup.addClass('nopointer');

    var $inner = $popup.find('.popup');

    return dom.multi_transition([
      { el: $popup, args: { 'opacity': 0 } },
      { el: $inner, args: { 'margin-top': 0 } }
    ]).then(function() {
      $popup.css({ 'display': 'none' });
    });
  };

  /**
   * Destroy the currently visible popup(s)
   *
   * @param {String} [type]
   * @return {Promise}
   */
  popups.destroy = function(type) {
    if (!(currentView instanceof popups.PopupView)) {
      return utils.resolve(true);
    }

    if (!type || (type === currentView.$el.data('type'))) {
      return currentView.destroy();
    }
  };

  /**
   * User prompt using input popup
   *
   * @param {String} title - locale key to use as popup title
   * @param {Object|Array} - inputs, or an array of inputs
   * @return {Promise}
   */
  popups.prompt = function(title, inputs) {
    return popups.popup('input', title, utils.ensure_array(inputs));
  };

  popups.type = function() {
    return $(popupEl).data('type');
  };

  return popups;
});
