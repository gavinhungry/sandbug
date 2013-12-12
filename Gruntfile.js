module.exports = function(grunt) {

  grunt.initConfig({
    requirejs: {
      production: {
        options: {
          baseUrl: './public/src/js',
          mainConfigFile: './public/src/js/require.config.js',
          findNestedDependencies: true,
          name: 'main',

          out: './public/js/debuggerio.min.js',
          preserveLicenseComments: true,

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
            codemirror_coffeescript: 'empty:'
          },

          exclude: ['promise']
        }
      }
    },

    less: {
      production: {
        options: { cleancss: true },
        files: {
          'public/css/debuggerio.light.min.css':
          'public/src/less/debuggerio.light.less',

          'public/css/debuggerio.dark.min.css':
          'public/src/less/debuggerio.dark.less'
        }
      }
    },

    cssmin: {
      production: {
        src: ['server/static/css/gfm.css'],
        dest: 'server/static/css/gfm.min.css'
      }
    },

    clean: {
      js: ['public/js'],
      css: [
        'public/css',
        'server/static/css/gfm.min.css'
      ]
    }
  });

  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-yui-compressor');
  grunt.loadNpmTasks('grunt-contrib-clean');

  grunt.registerTask('default', ['clean', 'requirejs', 'less', 'cssmin']);
};
