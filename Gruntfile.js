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

            transit: 'empty:',
            nano: 'empty:',
            hammer: 'empty:',
            string: 'empty:',

            cm_overlay: 'empty:',
            cm_search: 'empty:',

            cm_xml: 'empty:',
            cm_html: 'empty:',
            cm_markdown: 'empty:',
            cm_gfm: 'empty:',
            cm_jade: 'empty:',
            cm_ruby: 'empty:',
            cm_haml: 'empty:',

            cm_css: 'empty:',
            cm_less: 'empty:',

            cm_js: 'empty:',
            cm_coffeescript: 'empty:'
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
        src: ['frame/css/gfm.css'],
        dest: 'frame/css/gfm.min.css'
      }
    },

    'clean': {
      build: ['build.json'],
      js: ['public/js/debuggerio.min.js'],
      css: [
        'public/css',
        'frame/css/gfm.min.css'
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
        date: grunt.template.date(new Date(), 'isoUtcDateTime'),
        rev: rev.toString()
      }));
    });

    grunt.task.run('git-describe');
  });

  grunt.registerTask('default', [
    'clean', 'requirejs', 'less', 'cssmin', 'rev'
  ]);
};
