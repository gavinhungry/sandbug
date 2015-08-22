/*
 * debugger.io: An interactive web scripting sandbox
 *
 * flash.js: flash messages
 */

define(function(require) {
  'use strict';

  var $      = require('jquery');
  var _      = require('underscore');
  var bus    = require('bus');
  var config = require('config');
  var utils  = require('utils');

  var dom       = require('dom');
  var locales   = require('locales');
  var templates = require('templates');

  // ---

  var flash = utils.module('flash');

  var flashEl = '#flash';
  var lastHeading;
  var lastBody;
  var timeout;

  var priorities = ['bad', 'good'];
  var transition_props;

  bus.init(function(av) {
    flash.console.log('init flash module');

    transition_props = dom.css(_.str.sprintf('%s._transition', flashEl));
    $(flashEl).on('click', function(e) { flash.dismiss(); });
  });

  /**
   * Flash a message to the user
   *
   * Message are dismissed after `config.flash_duration` (ms) or by clicking
   *
   * @param {String | Promise} heading_m - heading of message (first line)
   * @param {String | Promise} [body_m] - body of message (second line)
   * @param {Object} [opts] - additional options
   *   @param {Boolean} [no_timeout] - if true, do not timeout flash message
   *   @param {Boolean} [wide] - if true, make the flash message wider
   * @param {String} [priority] - string from `priorities` (default is neutral)
   */
  flash.message = function(heading_m, body_m, opts, priority) {
    opts = opts || {};

    var $flash = $(flashEl);
    var timeout_fn = opts.no_timeout ? _.noop : start_dismiss_timeout;

    var template_p = templates.get('flash');

    if (!body_m && body_m !== false && _.isString(heading_m) && locales.is_prefixed(heading_m)) {
      body_m = _.str.sprintf('%s_msg', heading_m);
    }

    heading_m = locales.prefixed(heading_m);
    body_m = locales.prefixed(body_m);

    return $.when(heading_m, body_m, template_p)
      .then(function(heading, body, template_fn)
    {
      if (!heading) { return; }

      // don't do anything if this is the same message as last time
      if (heading === lastHeading && body === lastBody) {
        return timeout_fn();
      }

      flash.dismiss().done(function() {
        $flash.toggleClass('wide', !!opts.wide);

        var html = template_fn({
          heading: heading,
          body: body
        });

        lastHeading = heading;
        lastBody = body;

        $flash.removeClass(priorities.join(' '));
        if (_.contains(priorities, priority)) {
          $flash.addClass(priority);
        }

        $flash.css({ 'margin-top': $flash.height() * -1 })
          .html(html)
          .css({ 'display': 'block' })
          .transition(transition_props, timeout_fn);
      });
    });
  };

  // eg. flash.message_bad
  _.each(priorities, function(priority) {
    flash['message_' + priority] = function() {
      var args = _.toArray(arguments);
      args.length = flash.message.length - 1;
      args.push(priority);
      return flash.message.apply(null, args);
    };
  });

  /**
   * Flash error message from jqXHR fail callback
   *
   * @param {jqXHR} xhr
   */
  flash.xhr_error = function(xhr, status, err) {
    var statusString = _.str.sprintf('%s %s', xhr.statusCode().status, xhr.statusText);
    flash.message_bad(statusString);
  };

  /**
   * Dismiss the flash message
   *
   * @return {Promise} to resolve when the flash message is hidden
   */
  flash.dismiss = function() {
    var d = $.Deferred();
    var $flash = $(flashEl);

    $flash.transition({
      'margin-top':  $flash.height() * -1,
      'opacity': 0
    }, 'fast', function() {
      $flash.css({ 'display': 'none' });
      lastHeading = null;
      lastBody = null;

      d.resolve(true);
    });

    return d.promise();
  };

  /**
   * Initiate a timeout to dismiss the flash message
   */
  var start_dismiss_timeout = function() {
    clearTimeout(timeout);
    timeout = setTimeout(flash.dismiss, config.flash_duration);
  };

  return flash;
});
