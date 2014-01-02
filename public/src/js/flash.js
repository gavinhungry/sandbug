/*
 * debugger.io: An interactive web scripting sandbox
 *
 * flash.js: flash messages
 */

define([
  'config', 'utils', 'jquery', 'underscore',
  'bus', 'dom', 'locales', 'templates'
],
function(config, utils, $, _, bus, dom, locales, templates) {
  'use strict';

  var flash = utils.module('flash');

  var flashEl = '#flash';
  var lastHeading;
  var lastBody;
  var timeout;

  var priorities = ['bad', 'good'];
  var transition_props;

  bus.init(function(av) {
    utils.log('init flash module');

    transition_props = dom.css(_.sprintf('%s._transition', flashEl));
    $(flashEl).on('click', function(e) { flash.dismiss(); });
  });

  /**
   * Flash a message to the user
   *
   * Message are dismissed after `config.flash_duration` (ms) or by clicking
   *
   * @param {String | Promise} heading_m - heading of message (first line)
   * @param {String | Promise} [body_m] - body of message (second line)
   * @param {String} [priority] - string from `priorities` (default is neutral)
   */
  flash.message = function(heading_m, body_m, priority) {
    var $flash = $(flashEl);

    var template_p = templates.get('flash');

    $.when(heading_m, body_m, template_p)
      .done(function(heading, body, template_fn)
    {
      // don't do anything if this is the same message as last time
      if (heading === lastHeading && body === lastBody) {
        return start_dismiss_timeout();
      }

      flash.dismiss().done(function() {
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

        $flash.css({ 'top': $flash.height() * -1 })
          .html(html)
          .css({ 'display': 'block' })
          .transition(transition_props, start_dismiss_timeout);
      });
    });
  };

  // eg. flash.message_bad
  _.each(priorities, function(priority) {
    flash['message_' + priority] = function(heading, body) {
      return flash.message(heading, body, priority);
    };
  });

  /**
   * Flash a LocaleMsg from the server
   *
   * @param {Object} msg - LocaleMsg
   * @param {String} [priority] - override the priority of the LocaleMsg
   */
  flash.locale_message = function(msg, priority) {
    var heading_p = $.Deferred();

    if (typeof msg === 'string') { flash.message(msg); }
    else if (msg.localize) {

      var headingStrId = utils.ensure_string(msg.localize);
      var bodyStrId = _.sprintf('%s_msg', headingStrId);

      var head_args = utils.ensure_array(msg.args.head);
      head_args.unshift(headingStrId);

      var msg_args = utils.ensure_array(msg.args.msg);
      msg_args.unshift(bodyStrId);

      var heading_p = locales.string(head_args);
      var body_p = locales.string(msg_args);

      flash.message(heading_p, body_p, msg.priority || priority);
    }
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
      'top':  $flash.height() * -1,
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
