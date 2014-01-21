/*
 * debugger.io: An interactive web scripting sandbox
 */

define([
  'module', 'path', 'config', 'utils', 'underscore', 'q',
  'marked', 'jade', 'less', 'node-sass',
  'coffee-script', 'typestring', 'gorillascript'
],
function(
  module, path, config, utils, _, Q,
  marked, jade, less, sass, cs, ts, gs
) {
  'use strict';

  var __dirname = path.dirname(module.uri);
  var compilers = {};

  /**
   * All compilers should return a promise, and always resolve, either to
   * a compiled result, or the original input
   */
  var compilers_map = (function() {

    marked.setOptions({ gfm: true });

    return {

      // MARKUP
      'jade': function(str) {
        var d = Q.defer();

        try { var html = jade.render(str); d.resolve(html); }
        catch(err) { console.log(err); d.resolve(str); }

        return d.promise;
      },

      'gfm': function(str) {
        var d = Q.defer();

        try { var html = marked(str); d.resolve(html); }
        catch(err) { d.resolve(str); }

        return d.promise;
      },

      // STYLE
      'less': function(str) {
        var d = Q.defer();

        try { less.render(str, function(e, css) { d.resolve(css); }); }
        catch(err) { d.resolve(str); }

        return d.promise;
      },

      'scss': function(str) {
        var d = Q.defer();

        try {
          sass.render({
            data: str,
            success: function(css) { d.resolve(css); },
            error: function(err) { d.resolve(str); },
          });
        } catch(err) {
          d.resolve(str);
        }

        return d.promise;
      },

      // SCRIPT
      'coffeescript': function(str) {
        var d = Q.defer();

        try {
          var js = cs.compile(str);
          d.resolve(js);
        } catch(err) {
          d.resolve(str);
        }

        return d.promise;
      },

      'typescript': function(str) {
        var d = Q.defer();

        try {
          var js = ts.compile(str);
          d.resolve(js);
        } catch(err) {
          d.resolve(str);
        }

        return d.promise;
      },

      'gorillascript': function(str) {
        var d = Q.defer();

        try {
          gs.compile(str).then(function(result) {
            d.resolve(result.code);
          }, function(err) {
            d.resolve(str);
          });
        } catch(err) {
          d.resolve(str);
        }

        return d.promise;
      }

    };
  })();

  /**
   * Compile an input string, return a promise with the output
   *
   * @param {String} type: which compiler to use (eg. 'typescript')
   * @param {String} str: the input string of type `type`
   */
  compilers.compile = function(type, str) {
    type = utils.ensure_string(type);
    str = utils.ensure_string(str);

    // each compiler_fn should return a promise
    var compiler_fn = compilers_map[type];
    return _.isFunction(compiler_fn) ? compiler_fn(str) : Q(str);
  };

  return compilers;
});
