/*
 * debugger.io: An interactive web scripting sandbox
 *
 * dom.js: DOM helpers
 */

define(function(require) {
  'use strict';

  var $      = require('jquery');
  var _      = require('underscore');
  var bus    = require('bus');
  var config = require('config');
  var utils  = require('utils');

  var Backbone = require('backbone');

  // ---

  var dom = utils.module('dom');

  bus.init(function(av) {
    dom.console.log('init dom module');

    var $blank = $('#blank');
    var $button = $('<button></button>');
    $blank.empty().append($button);

    $('body').toggleClass('alt', !!$button.width());
    $blank.empty();

    bus.proxy('window:resize', 'dropdown:hide');
    bus.on('dropdown:hide', dom.hide_dropdowns);

    $('body').on('click', function(e) {
      var $t = $(e.target);

      if ($t.is('.dropdown-item') ||
        (!$t.is('.dropdown-button') && !$t.closest('.dropdown-menu').length)) {
        bus.trigger('dropdown:hide');
      }
    });
  });

  /**
   * Cache DOM elements by id and class name onto another object
   *
   * @param {Object} context - object to save references to
   * @param {jQuery} $source - source set within which to find elements
   * @param {Object} elements - { 'by_id' => Array, 'by_class' => Array }
   * @return {Function} execute to (re)query
   */
  dom.cache = function(context, $source, elements) {
    context = context || {};

    var query = function() {
      // #output cached to this.$output
      _.each(utils.ensure_array(elements.by_id), _.bind(function(id) {
        this['$' + _.str.underscored(id)] = $source.find('#' + id);
      }, context));

      // .panel-options elements cached to this.$panel_options
      _.each(utils.ensure_array(elements.by_class), _.bind(function(c) {
        this['$' + _.pluralize(_.str.underscored(c))] = $source.find('.' + c);
      }, context));

      // '[name="username"]' cached to this.$username
      _.each(utils.ensure_array(elements.by_name), _.bind(function(n) {
        this['$' + _.str.underscored(n)] = $source.find(_.str.sprintf('[name="%s"]', n));
      }, context));
    };

    query();
    return query;
  };

  /**
   * Stop listening to events on a Backbone View, but empty it instead of
   * removing it, as View.remove would do
   *
   * @param {Backbone.View} view - view to destroy
   */
  dom.destroy_view = function(view) {
    if (!(view instanceof Backbone.View)) { return; }
    dom.console.log('destroying view:', view.template);

    view.trigger('destroy');
    view.$el.empty();
    view.stopListening();
    view.undelegateEvents();
    bus.off_for(view);
  };

  /**
   * Get a *rounded* approximation of the width of an element, as a percentage
   *
   * @param {jQuery} $element - some element in the DOM
   * @return {String} percentage string
   */
  dom.get_percent_width = function($element) {
    var width = $element.width();
    var parentWidth = $element.parent().width();
    return Math.round((width / parentWidth) * 100) + '%';
  };

  /**
   * Get a *rounded* approximation of the height of an element, as a percentage
   *
   * @param {jQuery} $element - some element in the DOM
   * @return {String} percentage string
   */
  dom.get_percent_height = function($element) {
    var height = $element.height();
    var parentHeight = $element.parent().height();
    return Math.round((height / parentHeight) * 100) + '%';
  };

  /**
   * Determine is a node is currently detached from the DOM
   *
   * @param {jQuery} $element - some element which may or may not be in the DOM
   * @param {Document} [doc] - document to check, defaults to window.document
   * @return {Boolean} true if $element is not in the DOM, false otherwise
   */
  dom.is_detached = function($element, doc) {
    doc = doc || window.document;
    var docEl = doc.documentElement;

    return !$element.closest(docEl).length;
  };

  /**
   * Determine if an element is overflowing itself or a parent
   *
   * @param {jQuery} $element - some element in the DOM
   * @param {String} [closest] - compare $element to $element.closest(closest)
   * @return {Boolean} true if $element is overflowing, false otherwise
   */
  dom.is_overflowing = function($element, closest) {
    if (dom.is_detached($element)) { return false; }

    var $compare = closest ? $element.closest(closest) : $element;
    return $element[0].scrollHeight > $compare[0].offsetHeight;
  };

  /**
   * Get a CSS property from an enabled stylesheet
   *
   * @param {String} selector - CSS selector
   * @param {Boolean} [string] - if true, convert to CSS string
   * @return {Object|String} CSS property map matching selector
   */
  dom.css = function(selector, string) {
    var match;
    selector = utils.minify_css_selector(selector);

    // start with the last stylesheet
    var stylesheets = _.toArray(document.styleSheets).reverse();

    _.every(stylesheets, function(stylesheet) {
      // ignore disabled stylesheets
      if (stylesheet.disabled) { return true; } // continue

      var rules = stylesheet.cssRules || stylesheet.rules || [];
      match = _.find(rules, function(rule) {
        // find matching minified selector
        return utils.minify_css_selector(rule.selectorText) === selector;
      });

      return !match;
    });

    // always return an object
    if (!match) { return {}; }

    // remove selector and braces, leaving only the CSS properties
    var rule = match.cssText.replace(/^.*{\s*/, '').replace(/\s*}\s*$/, '');

    // convert the property string to an object
    var css = _.chain(rule.split(';')).map(function(property) {
      var map = _.map(property.split(':'), _.str.clean);
      return map.length === 2 ? map : null;
    }).compact().object().value();

    return !string ? css :
      _.reduce(css, function(str, value, prop) {
        return str + _.str.sprintf('%s: %s; ', prop, value);
      }, '').trim();
  };

  /**
   * Transition the width of a button while changing its label
   *
   * @param {jQuery} $button - button element
   * @param {String} label - new label to set
   */
  dom.transition_button_label = function($button, label) {
    $button = utils.ensure_jquery($button);

    // set a fixed width now, change the label and transition
    // to an "auto-esque" state
    var width = $button.outerWidth();
    $button.css({ 'min-width': width, 'max-width': width });

    $button.text(label);

    // HACK: wait for a repaint
    _.delay(function() {
      $button.stop().transition({ 'min-width': 0, 'max-width': 300 }, 'fast');
    }, 10);
  };

  /**
   * Run multiple CSS transitions in parallel, then return a single promise
   *
   * @example
   *
   * dom.multi_transition([
   *   [ el: '#first', args: { opacity: 1 } ],
   *   [ el: '#second', args: { height: 0 } ]
   * ]);
   *
   * el: DOM node, jQuery selector or jQuery object to transition
   * [args]: array of options (or single option) for $.fn.transition
   *
   * @param {Array} transitions - elements to transition
   * @return {Promise}
   */
  dom.multi_transition = function(transitions) {
    var transitions_p = _.map(transitions, function(opts) {
      var d = $.Deferred();
      var $el = $(opts.el);

      var args = _.clone(utils.ensure_array(opts.args));
      args.push('fast');
      args.push(d.resolve);

      $.fn.transition.apply($el.stop(), args);
      return d.promise();
    });

    return $.when.apply(null, transitions_p);
  };

  /**
   * Set up a new dropdown
   *
   * @param {jQuery} $buttons - dropdown trigger button
   */
  dom.dropdown = function($buttons) {
    $buttons.each(function() {
      var $button = $(this);

      var dropdown = $button.data('dropdown');
      var $menu = $button.siblings().filter(function() {
        return $(this).data('dropdown') === dropdown;
      }).first();

      var right = $menu.hasClass('dropdown-right');

      $button.on('click', function(e) {
        dom.hide_dropdowns($button, $menu);

        var offset = $button.offset();
        var active = $button.hasClass('active');

        var left = offset.left;
        var menuWidth = $menu.outerWidth();

        if (right) {
          left += ($button.outerWidth() - menuWidth);
        }

        var overflow = (left + menuWidth) - $(window).width() + 6;

        if (overflow > 0) {
          left -= overflow;
          $menu.addClass('dropdown-right');
        }

        $menu.css({
          left: left,
          top: offset.top + $button.outerHeight() + 2
        });

        if (active) {
          $menu.flowUp();
          $button.removeClass('active');
        } else {
          $menu.flowDown();
          $button.addClass('active');
        }
      });
    });
  };

  /**
   * Hide all dropdowns
   *
   * @param {jQuery} [$button] - except this button
   * @param {jQuery} [$menu] - except this menu
   */
  dom.hide_dropdowns = function($button, $menu) {
    $('.dropdown-button:not(.sticky)').not($button).removeClass('active');
    $('.dropdown-menu:not(.sticky)').not($menu).flowUp();
  };

  return dom;
});
