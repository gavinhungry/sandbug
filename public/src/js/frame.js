/*
 * debugger.io: An interactive web scripting sandbox
 *
 * frame.js: sandboxed iframe
 */

define([
  'config', 'utils', 'jquery', 'underscore',
  'bus', 'mirrors'
],
function(config, utils, $, _, bus, mirrors) {
  'use strict';

  var frame = utils.module('frame');

  var $input, frameWindow;
  var pending = [];

  bus.init(function(av) {
    $input = av.$input;
    frameWindow = av.$iframe[0].contentWindow;

    // ack from server
    $(window).on('message', function(e) {
      var oe = e.originalEvent;
      if (oe.origin !== config.frame) { return; }

      // remove from list of pending messages
      pending = _.without(pending, oe.data);
    });
  });

  /**
   * Send all input to the iframe for compilation
   */
  frame.update = function() {
    var timestamp = (new Date()).toISOString();
    pending.push(timestamp);

    var post_fn = function() {
      utils.log('postMessage', timestamp);

      if (!_.contains(pending, timestamp)) {
        return clearInterval(interval);
      }

      frameWindow.postMessage({
        timestamp: timestamp,
        map: mirrors.get_map()
      }, config.frame);
    };

    // keep sending data until an ack is recieved from the iframe
    var interval = setInterval(post_fn, 100);
    post_fn();
  };

  return frame;
});
