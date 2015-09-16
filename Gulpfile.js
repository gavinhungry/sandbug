(function() {
  'use strict';

  var del       = require('del');
  var fs        = require('fs');
  var git       = require('git-rev');
  var gulp      = require('gulp');
  var less      = require('gulp-less');
  var nodemon   = require('gulp-nodemon');
  var overtake  = require('overtake');
  var rename    = require('gulp-rename');
  var rjs       = require('requirejs');
  var symlink   = require('gulp-symlink');
  var uglifycss = require('gulp-uglifycss');

  var minified = { suffix: '.min' };

  /**
   * Clean existing build files
   */
  gulp.task('clean', function(done) {
    del([
      './build.json',
      './public/css',
      './public/js',
      './frame/css/*.min.css'
    ]).then(function(paths) {
      done();
    });
  });

  /**
   * Create underscorejs module symlink so we can use the "underscore" name
   * to include mixins
   */
  gulp.task('symlink', function() {
    return gulp.src('node_modules/underscore')
      .pipe(symlink('node_modules/underscorejs', {
        log: false,
        force: true
      }));
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

      // local files with individual licenses
      exclude: ['promise', 'objmap', 'deepclone']
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
      .pipe(uglifycss())
      .pipe(rename(minified))
      .pipe(gulp.dest('./public/css'));
  });

  /**
   * Compress static CSS files
   */
  gulp.task('css', function() {
    return gulp.src(['./frame/css/*.css', '!./**/*.min.css'])
      .pipe(uglifycss())
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
    nodemon({
      script: 'debuggerio.js',
      ext: 'js json',
      ignore: ['.git', 'node_modules', 'frame', 'public']
    }).on('quit', done);
  });

  /**
   * Check for CDN updates
   */
  gulp.task('cdn', function(done) {
    var filenames = [];

    gulp.src([
      '!node_modules/**',
      '!./**/*.min.*',
      './**/*.js',
      './**/*.less',
      './**/*.html'
    ], { read: false })
    .on('data', function(file) {
      filenames.push(file.path.replace(new RegExp('^' + file.base), ''));
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
    return gulp.start('symlink', 'js', 'less', 'css', 'rev');
  });

})();
