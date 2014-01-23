/*
 * debugger.io: An interactive web scripting sandbox
 *
 * compilers.js: content compilers
 */

define([
  'config', 'utils', 'jquery', 'underscore',
  'templates', 'marked', 'less', 'sass'
],
function(config, utils, $, _, templates, marked, less, sass) {
  'use strict';

  var compilers = utils.module('compilers');

  var compilers_map = (function() {

    marked.setOptions({ gfm: true });
    var lessc = new less.Parser();

    return {
      // MARKUP
      'gfm': function(str) {
        var markup = marked(str);
        return utils.resolve_now(markup);
      },

      // STYLE
      'less': function(str) {
        var d = $.Deferred();

        lessc.parse(str, function (err, tree) {
          var style = err ? str : tree.toCSS();
          d.resolve(style);
        });

        return d.promise();
      },

      'scss': function(str) {
        var result = sass.compile(str);
        var style = _.isString(result) ? result : str;
        return utils.resolve_now(style);
      }

      // SCRIPT
    };
  })();

  /**
   * Build a document string out of compiled inputs
   *
   * @param {Array} compiled - array of compiled inputs
   * @return {Promise} to return a document string
   */
  compilers.build_document = function(compiled) {
    var d = $.Deferred();

    var locals = _.reduce(compiled, function(memo, value) {
      memo[value.panel] = _.pick(value, 'mode', 'output');
      return memo;
    }, {});

    templates.get('output').done(function(template_fn) {
      var doc = template_fn(locals);
      d.resolve(doc);
    });

    return d.promise();
  };

  /**
   * Compile an input
   *
   * @return {Promise}
   */
  compilers.compile = function(input) {
    var fn = compilers_map[input.mode];
    var output;

    try {
      output = _.isFunction(fn) ? fn(input.content) : input.content;
    } catch(err) {
      output = input.content;
    }

    return $.when(output).then(function(compiled) {
      var out = utils.clone(input);
      out.output = compiled;
      return out;
    });
  };

  return compilers;
});
