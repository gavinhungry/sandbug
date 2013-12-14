module.exports = function(grunt) {

  grunt.file.defaultEncoding = 'utf8';

  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-yui-compressor');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-git-describe');

  grunt.initConfig({
    'requirejs': {
      production: {
        options: {
          baseUrl: './public/src/js',
          mainConfigFile: './public/src/js/require.config.js',

          name: 'main',
          out: './public/js/debuggerio.min.js',

          pragmas: { bustCache: true },
          findNestedDependencies: true,
          preserveLicenseComments: true,
          useStrict: true,

          paths: {
            jqueryjs: 'empty:',
            underscorejs: 'empty:',
            backbonejs: 'empty:',
            codemirrorjs: 'empty:',

            ui: 'empty:',
            transit: 'empty:',
            nano: 'empty:',
            string: 'empty:',

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

          exclude: ['promise', 'inflection']
        }
      }
    },

    'less': {
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

    'cssmin': {
      production: {
        src: ['server/static/css/gfm.css'],
        dest: 'server/static/css/gfm.min.css'
      }
    },

    'clean': {
      build: ['build.json'],
      js: ['public/js'],
      css: [
        'public/css',
        'server/static/css/gfm.min.css'
      ]
    },

    'git-describe': {
      production: {
        options: {
          template: '{%=object%}',
        }
      }
    }
  });

  grunt.task.registerTask('rev', function() {
    grunt.event.once('git-describe', function (rev) {
      grunt.file.write('./build.json', JSON.stringify({
        timestamp: (new Date().getTime()),
        rev: rev.toString()
      }));
    });

    grunt.task.run('git-describe');
  });

  grunt.registerTask('default', [
    'clean', 'requirejs', 'less', 'cssmin', 'rev'
  ]);
};
