(function() {
  'use strict';

  define(['jquery', 'underscore', 'string'], function($, _, str) {
    _.mixin(str.exports());

    var compiler = {};

    var clone = function(obj) { return JSON.parse(JSON.stringify(obj)); };

    var template_fn_p = $.get('/templates/output.html')
      .then(function(template) { return _.template(template); });

    /**
     * Load modules, pass them to a callback in a try/catch block, which may or
     * may not return a promise.
     *
     * @param {Array} libs - modules to load
     * @param {Function} callback - function to pass module to
     * @return {Promise} resolves to resolved value from callback
     */
    var require_p = function(libs, callback) {
      var d = $.Deferred();

      require(libs, function() {
        var result_m = null;

        try {
          result_m = callback.apply(null, arguments);
        } catch(err) {
          console.error(err);
          d.reject(err);
        }

        $.when(result_m).done(d.resolve).fail(d.reject);
      });

      return d.promise();
    };

    /**
     * Map of compile targets to compilation functions
     */
    var compilers_map = {
      // MARKUP
      gfm: function(str) {
        return require_p(['marked'], function(marked) {
          marked.setOptions({ gfm: true });
          return marked(str);
        });
      },

      jade: function(str) {
        return require_p(['jade'], function(jade) {
          return jade.render(str);
        });
      },

      haml: function(str) {
        return require_p(['haml'], function(haml) {
          return haml.compileHaml({ source: str })();
        });
      },

      // STYLE
      less: function(str) {
        return require_p(['less'], function(less) {
          var d = $.Deferred();

          (new less.Parser()).parse(str, function (err, tree) {
            if (err) { d.reject(err); }
            d.resolve(tree.toCSS());
          });

          return d.promise();
        });
      },

      scss: function(str) {
        return require_p(['sass'], function(sass) {
          var result = sass.compile(str);
          return  _.isString(result) ? result : null;
        });
      },

      // SCRIPT
      traceur: function(str) {
        return require_p(['traceur_api'], function(traceur) {
          var result = traceur.compile(str);
          return result.errors.length ? null : result.js;
        });
      },

      coffeescript: function(str) {
        return require_p(['coffeescript'], function(cs) {
          return cs.compile(str);
        });
      },

      typescript: function(str) {
        return require_p(['typestring'], function(ts) {
          return ts.compile(str);
        });
      },

      gorillascript: function(str) {
        return require_p(['gorillascript'], function(gs) {
          var d = $.Deferred();

          gs.compile(str).then(function(result) {
            d.resolve(result.code);
          }, d.reject);

          return d.promise();
        });
      }
    };

    /**
     * Compile inputs and build an output document
     *
     * @param {Object} inputs - map of inputs
     * @return {Promise} to return a full document string
     */
    compiler.compile_to_doc_str = function(inputs) {
      var d = $.Deferred();

      var compiling = _.map(inputs, function(input) {
        return compiler.compile(input);
      });

      $.when.apply(null, compiling).done(function() {
        var locals = _.reduce(arguments, function(memo, value) {

          memo[value.panel] = _.pick(value, 'mode', 'output');
          return memo;
        }, {});

        template_fn_p.done(function(template_fn) {
          var html = template_fn(locals);
          d.resolve(html);
        });
      }).fail(d.reject);

      return d.promise();
    };

    /**
     * Compile an input
     *
     * @param {Object} input - single input
     * @return {Promise} to return an object with compiled input
     */
    compiler.compile = function(input) {
      var d = $.Deferred();
      var out = clone(input);

      var fn = compilers_map[input.mode];
      var output = _.isFunction(fn) ? fn(input.content) : input.content;

      $.when(output).done(function(compiled) {
        out.output = compiled !== null ? compiled : input.content;
        d.resolve(out);
      }).fail(function() {
        out.output = input.content;
        d.resolve(out);
      });

      return d.promise();
    };

    return compiler;
  });

})();
