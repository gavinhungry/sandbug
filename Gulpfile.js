(function() {
  'use strict';

  var gulp = require('gulp');
  var fs   = require('fs');
  var git  = require('git-rev');
  var rjs  = require('requirejs');

  var overtake = require('overtake');

  var clean  = require('gulp-clean');
  var less   = require('gulp-less');
  var mincss = require('gulp-minify-css');
  var rename = require('gulp-rename');

  var minified = { suffix: '.min' };

  /**
   * Clean existing build files
   */
  gulp.task('clean', function() {
    return gulp.src([
      './build.json',
      './public/css',
      './public/js/*.min.js',
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
      .pipe(rename(minified))
      .pipe(gulp.dest('./public/css'));
  });

  /**
   * Compress static CSS files
   */
  gulp.task('css', function() {
    gulp.src(['./frame/css/*.css', '!./**/*.min.css'])
      .pipe(mincss())
      .pipe(rename(minified))
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
   * Watch for changes in JS and LESS files
   */
  gulp.task('watch', ['default'], function() {
    gulp.watch('./public/src/js/*.js', ['js']);
    gulp.watch('./public/src/less/*.less', ['less']);
  });

  /**
   * Check for CDN updates
   */
  gulp.task('cdn', function(done) {
    var filenames = [];
    overtake.opts.update_msg = '  [%s] [%s] [%s] %s => %s';

    gulp.src([
      '!node_modules/**',
      '!./**/*.min.*',
      './**/*.js',
      './**/*.less',
      './**/*.html'
    ], { read: false })
    .on('data', function(file) {
      filenames.push(file.path);
    }).on('end', function() {
      overtake.check_files(filenames, true).done(function() {
        done();
      });
    });
  });

  /**
   * Default task
   */
  gulp.task('default', ['clean'], function() {
    return gulp.start('js', 'less', 'css', 'rev');
  });

})();
