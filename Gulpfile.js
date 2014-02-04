(function() {
  'use strict';

  var gulp = require('gulp');
  var fs   = require('fs');
  var git  = require('git-rev');
  var rjs  = require('requirejs');

  var clean  = require('gulp-clean');
  var less   = require('gulp-less');
  var mincss = require('gulp-minify-css');
  var rename = require('gulp-rename');

  /**
   * Append '.min' to the base of a filename; use with `gulp-rename`
   */
  var dotmin = function(dir, base, ext) { return base + '.min' + ext; };

  /**
   * Clean existing build files
   */
  gulp.task('clean', function() {
    return gulp.src([
      './build.json',
      './public/js/debuggerio.min.js',
      './public/css',
      './frame/css/*.min.css'
    ], { read: false })
    .pipe(clean());
  });

  /**
   * Optimize scripts from AMD modules and build a single compressed JS file
   */
  gulp.task('js', function() {
    rjs.optimize({
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
    });
  });

  /**
   * Build LESS files for each theme into a single compressed CSS file
   */
  gulp.task('less', function() {
    gulp.src('./public/src/less/debuggerio.*.less')
    .pipe(less())
    .pipe(mincss())
    .pipe(rename(dotmin))
    .pipe(gulp.dest('./public/css'));
  });

  /**
   * Compress static CSS files
   */
  gulp.task('css', function() {
    gulp.src(['./frame/css/*.css', '!./**/*.min.css'])
    .pipe(mincss())
    .pipe(rename(dotmin))
    .pipe(gulp.dest('./frame/css'));
  });

  /**
   * Write a `build.json` file with build information
   */
  gulp.task('rev', function() {
    git.short(function(rev) {
      fs.writeFile('./build.json', JSON.stringify({
        date: (new Date()).toISOString(),
        rev: rev
      }));
    });
  });

  /**
   * Default task
   */
  gulp.task('default', ['clean'], function() {
    gulp.start('js', 'less', 'css', 'rev');
  });

})();
