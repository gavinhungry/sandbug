module.exports = function(grunt) {

  grunt.initConfig({
    requirejs: {
      compile: {
        options: {
          baseUrl: './public/js',
          mainConfigFile: './public/require.config.js',
          include: ['../require.config.js'],
          name: '../main',

          out: './public/debuggerio.min.js',
          preserveLicenseComments: false,

          paths: {
            jqueryjs: 'empty:',
            underscorejs: 'empty:',
            backbonejs: 'empty:',
            codemirrorjs: 'empty:',

            ui: 'empty:',
            transit: 'empty:',
            nano: 'empty:',
            string: 'empty:',
            inflection: 'empty:',

            codemirror_overlay: 'empty:',
            codemirror_search: 'empty:',

            codemirror_xml: 'empty:',
            codemirror_html: 'empty:',
            codemirror_markdown: 'empty:',
            codemirror_gfm: 'empty:',

            codemirror_css: 'empty:',
            codemirror_less: 'empty:',

            codemirror_js: 'empty:',
            codemirror_coffeescript: 'empty:',

            jasminejs: 'empty:',
            jasmine_html: 'empty:',
            jasmine_jquery: 'empty:'
          }
        }
      }
    },

    less: {
      production: {
        options: { yuicompress: true },
        files: {
          'public/css/debuggerio.light.min.css':
          'public/css/less/debuggerio.light.less',

          'public/css/debuggerio.dark.min.css':
          'public/css/less/debuggerio.dark.less'
        }
      }
    },

    cssmin: {
      production: {
        src: ['server/static/css/gfm.css'],
        dest: 'server/static/css/gfm.min.css'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-yui-compressor');
  grunt.registerTask('default', ['requirejs', 'less', 'cssmin']);
};
