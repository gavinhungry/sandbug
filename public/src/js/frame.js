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

    _.each(mirrors.get_all(), function(mirror) {
      mirror.cm.on('change', frame.debounced_update);
    });
  });

  /**
   * Send all input to the iframe for compilation
   */
  frame.update = function() {
    var timestamp = (new Date()).toISOString();
    pending.push(timestamp);

    var post_fn = function() {
      if (!_.contains(pending, timestamp)) {
        return clearInterval(interval);
      }

      utils.log('postMessage', timestamp);
      frameWindow.postMessage({
        timestamp: timestamp,
        map: mirrors.get_map()
      }, config.frame);
    };

    // keep sending data until an ack is recieved from the iframe
    var interval = setInterval(post_fn, 100);
    post_fn();
  };

  frame.debounced_update = _.debounce(frame.update, config.update_delay);

  return frame;
});
