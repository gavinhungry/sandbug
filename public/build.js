({
  baseUrl: './js',
  name: '../main',
  out: 'debuggerio.min.js',
  preserveLicenseComments: false,

  paths: {
    // libraries
    jqueryjs: 'empty:',
    underscorejs: 'empty:',
    backbonejs: 'empty:',
    codemirrorjs: 'empty:',

    // plugins
    ui: 'empty:',
    transit: 'empty:',
    nano: 'empty:',
    string: 'empty:',
    inflection: 'plugins/underscore.inflection.min',

    codemirror_overlay: 'empty:',
    codemirror_search: 'empty:',

    // CodeMirror markup
    codemirror_xml: 'empty:',
    codemirror_html: 'empty:',
    codemirror_markdown: 'empty:',
    codemirror_gfm: 'empty:',

    // CodeMirror style
    codemirror_css: 'empty:',
    codemirror_less: 'empty:',

    // CodeMirror script
    codemirror_js: 'empty:',
    codemirror_coffeescript: 'empty:',

    // testing
    jasminejs: 'empty:',
    jasmine_html: 'empty:',
    jasmine_jquery: 'plugins/jasmine-jquery.min'
  }
})