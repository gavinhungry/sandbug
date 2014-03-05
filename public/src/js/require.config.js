/**
 * debugger.io: An interactive web scripting sandbox
 * https://github.com/gavinhungry/debugger.io
 *
 * Copyright (C) 2013-2014 Gavin Lloyd <gavinhungry@gmail.com>
 * This is free software distributed under the terms of the MIT license
 */

(function() {
  'use strict';

  requirejs.config({
    baseUrl: '/src/js',

    //>> excludeStart('bustCache', pragmas.bustCache);
    urlArgs: 'v=' + (new Date().getTime()),
    //>> excludeEnd('bustCache');

    paths: {
      promise: '../../js/plugins/requirejs-promise.min',

      // libraries
      jqueryjs: '//cdnjs.cloudflare.com/ajax/libs/jquery/2.1.0/jquery.min',
      underscorejs: '//cdnjs.cloudflare.com/ajax/libs/lodash.js/2.4.1/lodash.min',
      backbonejs: '//cdnjs.cloudflare.com/ajax/libs/backbone.js/1.1.0/backbone-min',
      codemirrorjs: '//cdnjs.cloudflare.com/ajax/libs/codemirror/3.22.0/codemirror.min',
      hammer: '//cdnjs.cloudflare.com/ajax/libs/hammer.js/1.0.6/hammer.min',

      // plugins
      transit: '//cdnjs.cloudflare.com/ajax/libs/jquery.transit/0.9.9/jquery.transit.min',
      nano: '//cdnjs.cloudflare.com/ajax/libs/jquery.nanoscroller/0.7.6/jquery.nanoscroller.min',
      string: '//cdnjs.cloudflare.com/ajax/libs/underscore.string/2.3.3/underscore.string.min',
      inflection: '../../js/plugins/underscore.inflection.min',

      cm_overlay: '//cdnjs.cloudflare.com/ajax/libs/codemirror/3.22.0/addon/mode/overlay.min',
      cm_search: '//cdnjs.cloudflare.com/ajax/libs/codemirror/3.22.0/addon/search/searchcursor.min',

      // CodeMirror markup
      cm_xml: '//cdnjs.cloudflare.com/ajax/libs/codemirror/3.22.0/mode/xml/xml.min',
      cm_html: '//cdnjs.cloudflare.com/ajax/libs/codemirror/3.22.0/mode/htmlmixed/htmlmixed.min',
      cm_markdown: '//cdnjs.cloudflare.com/ajax/libs/codemirror/3.22.0/mode/markdown/markdown.min',
      cm_gfm: '//cdnjs.cloudflare.com/ajax/libs/codemirror/3.22.0/mode/gfm/gfm.min',
      cm_jade: '//cdnjs.cloudflare.com/ajax/libs/codemirror/3.22.0/mode/jade/jade.min',
      cm_ruby: '//cdnjs.cloudflare.com/ajax/libs/codemirror/3.22.0/mode/ruby/ruby.min',
      cm_haml: '//cdnjs.cloudflare.com/ajax/libs/codemirror/3.22.0/mode/haml/haml.min',

      // CodeMirror style
      cm_css: '//cdnjs.cloudflare.com/ajax/libs/codemirror/3.22.0/mode/css/css.min',
      cm_less: '//cdnjs.cloudflare.com/ajax/libs/codemirror/3.22.0/mode/less/less.min',

      // CodeMirror script
      cm_js: '//cdnjs.cloudflare.com/ajax/libs/codemirror/3.22.0/mode/javascript/javascript.min',
      cm_coffeescript: '//cdnjs.cloudflare.com/ajax/libs/codemirror/3.22.0/mode/coffeescript/coffeescript.min',

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
      transit: { deps: ['jqueryjs'], exports: '$.transit' },
      nano: { deps: ['jqueryjs'], exports: '$.fn.nanoScroller' },
      hammer: { deps: ['jqueryjs'] },
      string: { deps: ['underscorejs'], exports: '_.str' },
      inflection: { deps: ['underscorejs'] },

      cm_overlay: { deps: ['codemirrorjs'] },
      cm_search: { deps: ['codemirrorjs'] },
      cm_xml: { deps: ['codemirrorjs'] },
      cm_html: { deps: ['codemirrorjs'] },
      cm_markdown: { deps: ['codemirrorjs'] },
      cm_gfm: { deps: ['codemirrorjs', 'cm_overlay', 'cm_markdown'] },
      cm_jade: { deps: ['codemirrorjs'] },
      cm_ruby: { deps: ['codemirrorjs'] },
      cm_haml: { deps: ['codemirrorjs', 'cm_ruby'] },
      cm_css: { deps: ['codemirrorjs'] },
      cm_less: { deps: ['codemirrorjs'] },
      cm_js: { deps: ['codemirrorjs'] },
      cm_coffeescript: { deps: ['codemirrorjs'] }
    }
  });

})();
