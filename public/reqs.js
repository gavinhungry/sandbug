/*
 * debugger.io: An interactive web scripting sandbox
 */

(function() {
  'use strict';

  var CDNJS = '//cdnjs.cloudflare.com/ajax/libs';
  var configured = false;

  /**
   * Configure RequireJS for use with debugger.io
   *
   * @param {String} [basePrefix] - prefix of base scripts directory ('/js')
   * @param {Boolean} [bustCache] - if true, append current time to GET request
   * @param {Function} [callback] - ready callback function
   */
  window._debugger_io_require = function(basePrefix, bustCache, callback) {
    if (configured) {
      if (callback) { callback(); }
      return;
    }

    var baseUrl = '/' + (basePrefix || '') + 'js';

    requirejs.config({
      baseUrl: baseUrl,
      urlArgs: bustCache ? ('v=' + (new Date()).getTime()) : null,

      paths: {
        // libraries
        jqueryjs: CDNJS + '/jquery/2.0.3/jquery.min',
        underscorejs: CDNJS + '/lodash.js/2.4.1/lodash.min',
        backbonejs: CDNJS + '/backbone.js/1.1.0/backbone-min',
        codemirrorjs: CDNJS + '/codemirror/3.20.0/codemirror.min',

        // plugins
        ui: CDNJS + '/jqueryui/1.10.3/jquery-ui.min',
        transit: CDNJS + '/jquery.transit/0.9.9/jquery.transit.min',
        nano: CDNJS + '/jquery.nanoscroller/0.7.4/jquery.nanoscroller.min',
        string: CDNJS + '/underscore.string/2.3.3/underscore.string.min',
        inflection: 'plugins/underscore.inflection.min',

        codemirror_overlay: CDNJS + '/codemirror/3.20.0/addon/mode/overlay.min',
        codemirror_search: CDNJS + '/codemirror/3.20.0/addon/search/searchcursor.min',

        // CodeMirror markup
        codemirror_xml: CDNJS + '/codemirror/3.20.0/mode/xml/xml.min',
        codemirror_html: CDNJS + '/codemirror/3.20.0/mode/htmlmixed/htmlmixed.min',
        codemirror_markdown: CDNJS + '/codemirror/3.20.0/mode/markdown/markdown.min',
        codemirror_gfm: CDNJS + '/codemirror/3.20.0/mode/gfm/gfm.min',

        // CodeMirror style
        codemirror_css: CDNJS + '/codemirror/3.20.0/mode/css/css.min',
        codemirror_less: CDNJS + '/codemirror/3.20.0/mode/less/less.min',

        // CodeMirror script
        codemirror_js: CDNJS + '/codemirror/3.20.0/mode/javascript/javascript.min',
        codemirror_coffeescript: CDNJS + '/codemirror/3.20.0/mode/coffeescript/coffeescript.min',

        // testing
        jasminejs: CDNJS + '/jasmine/1.3.1/jasmine',
        jasmine_html: CDNJS + '/jasmine/1.3.1/jasmine-html',
        jasmine_jquery: 'plugins/jasmine-jquery.min'
      },

      shim: {
        // libraries
        jqueryjs: { exports: '$' },
        underscorejs: { exports: '_' },
        backbonejs: { deps: ['jqueryjs', 'underscorejs'], exports: 'Backbone' },
        codemirrorjs: { exports: 'CodeMirror' },

        // testing
        jasminejs: { exports: 'jasmine' },
        jasmine_html: { deps: ['jasminejs'] },
        jasmine_jquery: { deps: ['jasminejs', 'jquery'] },

        // plugins
        ui: { deps: ['jqueryjs'], exports: '$.ui' },
        transit: { deps: ['jqueryjs'], exports: '$.transit' },
        nano: { deps: ['jqueryjs'], exports: '$.fn.nanoScroller' },
        string: { deps: ['underscorejs'], exports: '_.str' },
        inflection: { deps: ['underscorejs'] },

        codemirror_overlay: { deps: ['codemirrorjs'] },
        codemirror_search: { deps: ['codemirrorjs'] },
        codemirror_xml: { deps: ['codemirrorjs'] },
        codemirror_html: { deps: ['codemirrorjs'] },
        codemirror_markdown: { deps: ['codemirrorjs'] },
        codemirror_gfm: { deps: ['codemirrorjs', 'codemirror_overlay', 'codemirror_markdown'] },
        codemirror_css: { deps: ['codemirrorjs'] },
        codemirror_less: { deps: ['codemirrorjs'] },
        codemirror_js: { deps: ['codemirrorjs'] },
        codemirror_coffeescript: { deps: ['codemirrorjs'] }
      }
    });

    require(['libs'], function() {
      configured = true;
      if (callback) { callback(); }
    });
  };
})();
