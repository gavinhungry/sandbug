(function() {
  'use strict';

  var fs       = require('fs');
  var git      = require('git-rev');
  var gulp     = require('gulp');
  var less     = require('gulp-less');
  var mincss   = require('gulp-minify-css');
  var nodemon  = require('gulp-nodemon');
  var overtake = require('overtake');
  var rename   = require('gulp-rename');
  var rimraf   = require('gulp-rimraf');
  var rjs      = require('requirejs');

  var minified = { suffix: '.min' };

  /**
   * Clean existing build files
   */
  gulp.task('clean', function() {
    return gulp.src([
      './build.json',
      './public/css',
      './public/js',
      './frame/css/*.min.css'
    ], { read: false })
    .pipe(rimraf());
  });

  /**
   * Optimize scripts from AMD modules and build a single compressed JS file
   */
  gulp.task('js', function(done) {
    rjs.optimize({
      baseUrl: './public/src/js',
      mainConfigFile: './public/src/js/require.config.js',

      name: 'main',
      out: './public/js/debuggerio.min.js',

      pragmas: { bustCache: true },
      findNestedDependencies: true,
      preserveLicenseComments: true,
      useStrict: true,

      exclude: ['promise']
    },
    function() { done(); },
    function(err) {
      console.error(err);
      done();
    });
  });

  /**
   * Build LESS files for each theme into a single compressed CSS file
   */
  gulp.task('less', function(done) {
    return gulp.src('./public/src/less/debuggerio.*.less')
      .pipe(less())
      .on('error', function(err) {
        console.error(err.message);
        done();
      })
      .pipe(mincss())
      .pipe(rename(minified))
      .pipe(gulp.dest('./public/css'));
  });

  /**
   * Compress static CSS files
   */
  gulp.task('css', function() {
    return gulp.src(['./frame/css/*.css', '!./**/*.min.css'])
      .pipe(mincss())
      .pipe(rename(minified))
      .pipe(gulp.dest('./frame/css'));
  });

  /**
   * Write a `build.json` file with build information
   */
  gulp.task('rev', function(done) {
    git.short(function(rev) {
      fs.writeFile('./build.json', JSON.stringify({
        date: (new Date()).toISOString(),
        rev: rev
      }, null, 2) + '\n', function() { done(); });
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
   * Keep watching and restart
   */
  gulp.task('dev', ['watch'], function(done) {
    nodemon({ script: 'debuggerio.js', ext: 'js json less' }).on('quit', done);
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
