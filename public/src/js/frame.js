/*
 * debugger.io: An interactive web scripting sandbox
 *
 * frame.js: sandboxed iframe
 */

define(function(require) {
  'use strict';

  var $      = require('jquery');
  var _      = require('underscore');
  var bus    = require('bus');
  var config = require('config');
  var utils  = require('utils');

  var com     = require('com');
  var mirrors = require('mirrors');

  // ---

  var frame = utils.module('frame');

  var $input, frameWindow;
  var pending = [];

  bus.init(function(av) {
    $input = av.$input;
    frameWindow = av.$iframe[0].contentWindow;

    $(window).on('message', function(e) {
      var oe = e.originalEvent;
      if (oe.origin !== config.frame) { return; }

      var data = oe.data;

      // ack from iframe: remove from list of pending updates
      if (data.action === 'ack') {
        pending = _.without(pending, data.timestamp);
      }

      if (data.action === 'console') {
        com.write(data.time, data.type, data.args);
      }
    });

    bus.on('mirrors:mode', function(panel, mode, label) {
      frame.update_by_panel(panel, true);
    });

    bus.on('mirrors:content', function(panel, content) {
      frame.update_by_panel(panel);
    });
  });

  /**
   * Send all input to the iframe for compilation
   * @param {Boolean} [noscript] - if true, exclude script from running
   * @param {Boolean} [css] - if true, live-update CSS and nothing else
   */
  frame.update = function(noscript, css) {
    var timestamp = (new Date()).toISOString();
    pending.push(timestamp);

    var post_fn = function() {
      if (!_.contains(pending, timestamp)) {
        return clearInterval(interval);
      }

      var map = mirrors.get_map();
      if (noscript) { map['script'].content = ''; }
      else { com.flush(); }

      frame.console.log('postMessage', timestamp);
      frameWindow.postMessage({
        timestamp: timestamp,
        map: map,
        css: !!css,
        patch: config.patch
      }, config.frame);
    };

    // keep sending data until an ack is recieved from the iframe
    var interval = setInterval(post_fn, config.ack_timeout);
    post_fn();
  };

  /**
   * Update by panel action
   *
   * @param {String} panel - panel id triggering update
   * @param {Boolean} [now] - update now if true, debounce otherwise
   */
  frame.update_by_panel = function(panel, now) {
    var auto_update = now ? frame.auto_update : frame.auto_update_d;

    switch(panel) {
      case 'markup':
        auto_update();
      break;

      case 'style':
        auto_update(true);
      break;

      case 'script':
        if (config.autorun) {
          auto_update();
        }
      break;
    }
  };

  frame.auto_update = function(css) {
    frame.update(!config.autorun, css);
  };

  frame.auto_update_d = _.debounce(frame.auto_update, config.update_delay);

  return frame;
});
