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

  var conn    = require('conn');
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
        conn.write(data.time, data.type, data.args);
      }
    });

    _.each(mirrors.get_all(), function(mirror) {
      mirror.cm.on('changes', function(changes) {

        var changed = !!_.find(utils.ensure_array(changes), function(change) {
          return !!change.display.prevInput;
        });

        if (changed) { frame.auto_update(); }
      });
    });
  });

  /**
   * Send all input to the iframe for compilation
   * @param {Boolean} [noscript] - if true, exclude script from running
   */
  frame.update = function(noscript) {
    var timestamp = (new Date()).toISOString();
    pending.push(timestamp);

    var post_fn = function() {
      if (!_.contains(pending, timestamp)) {
        return clearInterval(interval);
      }

      var map = mirrors.get_map();
      if (noscript) { map['script'].content = ''; }
      else { conn.flush(); }

      frame.console.log('postMessage', timestamp);
      frameWindow.postMessage({
        timestamp: timestamp,
        map: map
      }, config.frame);
    };

    // keep sending data until an ack is recieved from the iframe
    var interval = setInterval(post_fn, config.ack_retry);
    post_fn();
  };

  frame.auto_update = _.debounce(function() {
    frame.update(!config.autorun);
  }, config.update_delay);

  return frame;
});
