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
      jqueryjs: '//cdn.jsdelivr.net/jquery/2.1/jquery.min',
      underscorejs: '//cdn.jsdelivr.net/lodash/2.4/lodash.min',
      backbonejs: '//cdn.jsdelivr.net/backbonejs/1.1/backbone-min',
      codemirrorjs: '//cdn.jsdelivr.net/codemirror/4.0/codemirror.min',
      hammer: '//cdn.jsdelivr.net/hammerjs/1.0/hammer.min',

      // plugins
      ui: '//cdn.jsdelivr.net/jquery.ui/1.10/jquery-ui.min',
      transit: '//cdn.jsdelivr.net/jquery.transit/0.9/jquery.transit.min',
      nano: '//cdn.jsdelivr.net/nanoscrollerjs/0.7/javascripts/jquery.nanoscroller.min',
      string: '//cdn.jsdelivr.net/underscore.string/2.3/underscore.string.min',
      inflection: '../../js/plugins/underscore.inflection.min',

      cm_overlay: '//cdn.jsdelivr.net/codemirror/4.0/addon/mode/overlay',
      cm_search: '//cdn.jsdelivr.net/codemirror/4.0/addon/search/searchcursor',

      // CodeMirror markup
      cm_xml: '//cdn.jsdelivr.net/codemirror/4.0/mode/xml/xml',
      cm_html: '//cdn.jsdelivr.net/codemirror/4.0/mode/htmlmixed/htmlmixed',
      cm_markdown: '//cdn.jsdelivr.net/codemirror/4.0/mode/markdown/markdown',
      cm_gfm: '//cdn.jsdelivr.net/codemirror/4.0/mode/gfm/gfm',
      cm_jade: '//cdn.jsdelivr.net/codemirror/4.0/mode/jade/jade',
      cm_ruby: '//cdn.jsdelivr.net/codemirror/4.0/mode/ruby/ruby',
      cm_haml: '//cdn.jsdelivr.net/codemirror/4.0/mode/haml/haml',

      // CodeMirror style
      cm_css: '//cdn.jsdelivr.net/codemirror/4.0/mode/css/css',

      // CodeMirror script
      cm_js: '//cdn.jsdelivr.net/codemirror/4.0/mode/javascript/javascript',
      cm_coffeescript: '//cdn.jsdelivr.net/codemirror/4.0/mode/coffeescript/coffeescript',

      jquery: 'libs/jquery',
      underscore: 'libs/underscore',
      backbone: 'libs/backbone',
      codemirror: 'libs/codemirror'
    },

    map: {
      '*': {
        '../../lib/codemirror': 'codemirrorjs',
        '../../addon/mode/overlay': 'cm_overlay',
        '../search/search': 'cm_search',
        '../xml/xml': 'cm_xml',
        '../htmlmixed/htmlmixed': 'cm_html',
        '../markdown/markdown': 'cm_markdown',
        '../gfm/gfm': 'cm_gfm',
        '../jade/jade': 'cm_jade',
        '../ruby/ruby': 'cm_ruby',
        '../haml/haml': 'cm_haml',
        '../css/css': 'cm_css',
        '../javascript/javascript': 'cm_js',
        '../coffeescript/coffeescript': 'cm_coffeescript'
      },
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
      cm_js: { deps: ['codemirrorjs'] },
      cm_coffeescript: { deps: ['codemirrorjs'] }
    }
  });

})();
