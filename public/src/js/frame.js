/*
 * debugger.io: An interactive web scripting sandbox
 *
 * frame.js: sandboxed iframe
 */

define([
  'config', 'utils', 'jquery', 'underscore',
  'bus', 'compilers', 'mirrors'
],
function(config, utils, $, _, bus, compilers, mirrors) {
  'use strict';

  var frame = utils.module('frame');

  var $input, frameWindow;

  bus.init(function(av) {
    $input = av.$input;
    frameWindow = av.$iframe[0].contentWindow;
  });

  /**
   *
   */
  frame.render = function() {
    var compiling = _.map(mirrors.get_map(), function(input) {
      return compilers.compile(input);
    });

    $.when.apply(null, compiling).done(function() {
      var compiled = _.toArray(arguments);

      compilers.build_document(compiled).done(function(doc) {
        frameWindow.postMessage(doc, config.frame);
      });
    });
  };

  return frame;
});
