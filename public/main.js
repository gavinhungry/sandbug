//  Underscore.asdf.js
//  (c) 2011 Jeremy Ruppel
//  Underscore.razze is freely distributable under the MIT license.
//  Portions of Underscore.inflection are inspired or borrowed from ActiveSupport
//  Version 1.0.0

(function() {
  'use strict';

  var CDNJS = '//cdnjs.cloudflare.com/ajax/libs';
  var bustCache = true;

  requirejs.config({
    baseUrl: '/js',
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

  /**
   * jQuery
   *
   * Includes: jQuery UI, Transit, nanoScroller.js
   */
  define('jquery', ['jqueryjs', 'ui', 'transit', 'nano'],
  function($, ui, transit, nano) {
    // jQuery.transit fallback to $.fn.animate
    if (!$.support.transition) { $.fn.transition = $.fn.animate; }

    return $; // $.noConflict(false);
  });

  /**
   * Underscore.js (Lo-Dash)
   *
   * Includes: Underscore.string, underscore.inflection
   */
  define('underscore', ['underscorejs', 'string', 'inflection'],
  function(_, str, inflection) {
    _.mixin(str.exports());
    return _; // _.noConflict();
  });

  /**
   * Backbone.js
   *
   * Includes: nothing additional yet
   */
  define('backbone', ['backbonejs'],
  function(Backbone) {
    return Backbone; // Backbone.noConflict();
  });

  /**
   * CodeMirror
   *
   * Includes: Overlay, Search, XML, HTML, MD, GFM, CSS, LESS, JS, CoffeeScript
   */
  define('codemirror', [
    'codemirrorjs', 'codemirror_overlay', 'codemirror_search',
    'codemirror_xml', 'codemirror_html', 'codemirror_markdown', 'codemirror_gfm',
    'codemirror_css', 'codemirror_less',
    'codemirror_js', 'codemirror_coffeescript'
  ],
  function(CodeMirror, overlay, search, xml, html, md, gfm, css, less, js, cs) {
    return CodeMirror;
  });

  /**
   * Jasmine
   *
   * Includes: jasmine-html, jasmine-jquery
   */
  define('jasmine', ['jquery', 'jasminejs', 'jasmine_html', 'jasmine_jquery'],
  function($, jasmine, jasmine_html, jasmine_jquery) {
    return jasmine;
  });

  require(['jquery', 'app'], function($, app) {
    $(function() { new app.App(); });
  });

})();
