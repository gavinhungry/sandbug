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

      frame.console.log('postMessage', timestamp);
      frameWindow.postMessage({
        timestamp: timestamp,
        map: map
      }, config.frame);
    };

    // keep sending data until an ack is recieved from the iframe
    var interval = setInterval(post_fn, 100);
    post_fn();
  };

  frame.auto_update = _.debounce(function() {
    frame.update(!config.autorun);
  }, config.update_delay);

  return frame;
});
