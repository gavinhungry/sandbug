/**
 * debugger.io: An interactive web scripting sandbox
 * https://github.com/gavinhungry/debugger.io
 *
 * Copyright (C) 2013 Gavin Lloyd <gavinhungry@gmail.com>
 * This is free software distributed under the terms of the MIT license
 */

(function() {
  'use strict';

  requirejs.config({
    baseUrl: '/src/js',

    paths: {
      promise: 'plugins/requirejs-promise.min',

      // libraries
      jqueryjs: '//cdnjs.cloudflare.com/ajax/libs/jquery/2.0.3/jquery.min',
      underscorejs: '//cdnjs.cloudflare.com/ajax/libs/lodash.js/2.4.1/lodash.min',
      backbonejs: '//cdnjs.cloudflare.com/ajax/libs/backbone.js/1.1.0/backbone-min',
      codemirrorjs: '//cdnjs.cloudflare.com/ajax/libs/codemirror/3.20.0/codemirror.min',

      // plugins
      ui: '//cdnjs.cloudflare.com/ajax/libs/jqueryui/1.10.3/jquery-ui.min',
      transit: '//cdnjs.cloudflare.com/ajax/libs/jquery.transit/0.9.9/jquery.transit.min',
      nano: '//cdnjs.cloudflare.com/ajax/libs/jquery.nanoscroller/0.7.4/jquery.nanoscroller.min',
      string: '//cdnjs.cloudflare.com/ajax/libs/underscore.string/2.3.3/underscore.string.min',
      inflection: 'plugins/underscore.inflection.min',

      codemirror_overlay: '//cdnjs.cloudflare.com/ajax/libs/codemirror/3.20.0/addon/mode/overlay.min',
      codemirror_search: '//cdnjs.cloudflare.com/ajax/libs/codemirror/3.20.0/addon/search/searchcursor.min',

      // CodeMirror markup
      codemirror_xml: '//cdnjs.cloudflare.com/ajax/libs/codemirror/3.20.0/mode/xml/xml.min',
      codemirror_html: '//cdnjs.cloudflare.com/ajax/libs/codemirror/3.20.0/mode/htmlmixed/htmlmixed.min',
      codemirror_markdown: '//cdnjs.cloudflare.com/ajax/libs/codemirror/3.20.0/mode/markdown/markdown.min',
      codemirror_gfm: '//cdnjs.cloudflare.com/ajax/libs/codemirror/3.20.0/mode/gfm/gfm.min',

      // CodeMirror style
      codemirror_css: '//cdnjs.cloudflare.com/ajax/libs/codemirror/3.20.0/mode/css/css.min',
      codemirror_less: '//cdnjs.cloudflare.com/ajax/libs/codemirror/3.20.0/mode/less/less.min',

      // CodeMirror script
      codemirror_js: '//cdnjs.cloudflare.com/ajax/libs/codemirror/3.20.0/mode/javascript/javascript.min',
      codemirror_coffeescript: '//cdnjs.cloudflare.com/ajax/libs/codemirror/3.20.0/mode/coffeescript/coffeescript.min',

      jquery: 'libs/jquery',
      underscore: 'libs/underscore',
      backbone: 'libs/backbone',
      codemirror: 'libs/codemirror'
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

})();
