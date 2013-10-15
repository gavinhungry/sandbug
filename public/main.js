/*
 * debugger.io: An interactive web scripting sandbox
 */

(function() {
  'use strict';
  var CDNJS = '//cdnjs.cloudflare.com/ajax/libs';

  requirejs.config({
    baseUrl: '/js',
    urlArgs: 'v=' + (new Date()).getTime(),

    paths: {
      // libraries
      jqueryjs: CDNJS + '/jquery/2.0.3/jquery.min',
      underscorejs: CDNJS + '/underscore.js/1.5.2/underscore-min',
      backbonejs: CDNJS + '/backbone.js/1.0.0/backbone-min',
      codemirrorjs: CDNJS + '/codemirror/3.16.0/codemirror.min',

      // plugins
      ui: CDNJS + '/jqueryui/1.10.3/jquery-ui.min',
      transit: CDNJS + '/jquery.transit/0.9.9/jquery.transit.min',
      nano: CDNJS + '/jquery.nanoscroller/0.7.4/jquery.nanoscroller.min',
      string: CDNJS + '/underscore.string/2.3.3/underscore.string.min',
      inflection: 'plugins/underscore.inflection.min',
      codemirror_js: CDNJS + '/codemirror/3.16.0/mode/javascript/javascript.min',
      codemirror_css: CDNJS + '/codemirror/3.16.0/mode/css/css.min',
      codemirror_xml: CDNJS + '/codemirror/3.16.0/mode/xml/xml.min',
      codemirror_html: CDNJS + '/codemirror/3.16.0/mode/htmlmixed/htmlmixed.min',
      codemirror_search: CDNJS + '/codemirror/3.16.0/addon/search/searchcursor.min',

      // libraries with plugins
      jquery: 'lib/jquery',
      underscore: 'lib/underscore',
      backbone: 'lib/backbone',
      codemirror: 'lib/codemirror'
    },

    shim: {
      // libraries
      jqueryjs: { exports: '$' },
      underscorejs: { exports: '_' },
      backbonejs: { deps: ['jqueryjs', 'underscorejs'], exports: 'Backbone' },
      codemirrorjs: { exports: 'CodeMirror' },

      // plugins
      ui: { deps: ['jqueryjs'], exports: '$.ui' },
      transit: { deps: ['jqueryjs'], exports: '$.transit' },
      nano: { deps: ['jqueryjs'], exports: '$.fn.nanoScroller' },
      string: { deps: ['underscorejs'], exports: '_.str' },
      inflection: { deps: ['underscorejs'] },
      codemirror_js: { deps: ['codemirrorjs'] },
      codemirror_css: { deps: ['codemirrorjs'] },
      codemirror_xml: { deps: ['codemirrorjs'] },
      codemirror_html: { deps: ['codemirrorjs'] },
      codemirror_search: { deps: ['codemirrorjs'] }
    }
  });

  require(['jquery', 'app'],
  function($, app) {
    'use strict';

    $(function() {
      new app.App();
    });

  });
})();
