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

      // plugins
      ui: CDNJS + '/jqueryui/1.10.3/jquery-ui.min',
      transit: CDNJS + '/jquery.transit/0.9.9/jquery.transit.min',
      string: CDNJS + '/underscore.string/2.3.3/underscore.string.min',
      inflection: 'plugins/underscore.inflection.min',

      // libraries with plugins
      jquery: 'lib/jquery',
      underscore: 'lib/underscore',
      backbone: 'lib/backbone'
    },

    shim: {
      // libraries
      jqueryjs: { exports: '$' },
      underscorejs: { exports: '_' },
      backbonejs: { deps: ['jqueryjs', 'underscorejs'], exports: 'Backbone' },

      // plugins
      ui: { deps: ['jqueryjs'], exports: '$.ui' },
      transit: { deps: ['jqueryjs'], exports: '$.transit' },
      string: { deps: ['underscorejs'], exports: '_.str' },
      inflection: { deps: ['underscorejs'] }
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
