/*
 * debugger.io: An interactive web scripting sandbox
 *
 * compilers.js: content compilers
 */

define([
  'config', 'utils', 'jquery', 'underscore',
  'templates'
],
function(config, utils, $, _, templates) {
  'use strict';

  var compilers = utils.module('compilers');


  var compilers_map = (function() {

    return {



    };

  })();


  compilers.build_document = function(compiled) {
    var d = $.Deferred();

    var locals = _.reduce(compiled, function(memo, value) {
      memo[value.panel] = value.output;
      return memo;
    }, {});

    templates.get('output').done(function(template_fn) {
      var doc = template_fn(locals);
      d.resolve(doc);
    });

    return d.promise();
  };


  /**
   *
   * @return {Promise}
   */
  compilers.compile = function(input) {
    var compiler = compilers_map[input.mode];

    var output = _.isFunction(compiler) ? compiler(input.mode, input.content) :
      input.content;

    return $.when(output).then(function(compiled) {
      return {
        panel: input.panel,
        output: compiled
      }
    });
  };



  return compilers;
});
