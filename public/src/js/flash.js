/*
 * debugger.io: An interactive web scripting sandbox
 *
 * flash.js: flash messages
 */

define([
  'config', 'utils', 'jquery', 'underscore',
  'bus', 'templates'
],
function(config, utils, $, _, bus, templates) {
  'use strict';

  var flash = utils.module('flash');

  var flashEl = '#flash';
  var lastHeading;
  var lastBody;
  var timeout;

  var priorities = ['bad', 'good'];

  bus.once('init', function(av) {
    utils.log('init flash module');

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

        $flash.css({ 'top': $flash.height() * -1 }).html(html).show();
        $flash.transition({
          'top': config.flash_top,
          'opacity': config.flash_opacity
        }, function() {
          // wait until the flash message is visible before dismissing
          start_dismiss_timeout();
        });
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
      $flash.hide();
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
