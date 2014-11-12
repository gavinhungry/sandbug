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

    bus.on('mirrors:content', function(panel, content) {
      switch(panel) {
        case 'markup':
          frame.auto_update();
        break;

        case 'style':
          frame.auto_update(true);
        break;

        case 'script':
          if (config.autorun) {
            frame.auto_update();
          }
        break;
      }
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
        css: !!css
      }, config.frame);
    };

    // keep sending data until an ack is recieved from the iframe
    var interval = setInterval(post_fn, config.ack_timeout);
    post_fn();
  };

  frame.auto_update = _.debounce(function(css) {
    frame.update(!config.autorun, css);
  }, config.update_delay);

  return frame;
});
