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

  bus.init(function(av) {
    $input = av.$input;
    frameWindow = av.$iframe[0].contentWindow;
  });

  /**
   * Send all input to the iframe for compilation
   */
  frame.update = function() {
    frameWindow.postMessage(mirrors.get_map(), config.frame);
  };

  return frame;
});
