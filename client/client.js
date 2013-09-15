/*
 * jsbyte: An interactive JS/HTML/CSS environment
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
      underscorejs: CDNJS + '/underscore.js/1.5.1/underscore-min',
      backbonejs: CDNJS + '/backbone.js/1.0.0/backbone-min',
      codemirrorjs: CDNJS + '/codemirror/3.16.0/codemirror.min',

      // plugins
      ui: CDNJS + '/jqueryui/1.10.3/jquery-ui.min',
      transit: CDNJS + '/jquery.transit/0.9.9/jquery.transit.min',
      string: CDNJS + '/underscore.string/2.3.3/underscore.string.min',
      inflection: 'plugins/underscore.inflection.min',
      codemirror_js: CDNJS + '/codemirror/3.16.0/mode/javascript/javascript.min',
      codemirror_css: CDNJS + '/codemirror/3.16.0/mode/css/css.min',
      codemirror_xml: CDNJS + '/codemirror/3.16.0/mode/xml/xml.min',
      codemirror_html: CDNJS + '/codemirror/3.16.0/mode/htmlmixed/htmlmixed.min',

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
      string: { deps: ['underscorejs'], exports: '_.str' },
      inflection: { deps: ['underscorejs'] },
      codemirror_js: { deps: ['codemirrorjs'] },
      codemirror_css: { deps: ['codemirrorjs'] },
      codemirror_xml: { deps: ['codemirrorjs'] },
      codemirror_html: { deps: ['codemirrorjs'] }
    }
  });

  require(['jquery', 'app'],
  function($, jsbyte) {
    'use strict';

    $(function() {
      new jsbyte.App();
    });

  });
})();
