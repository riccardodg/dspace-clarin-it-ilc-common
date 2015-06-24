'use strict';

var gulp = require('gulp');

var $ = require('gulp-load-plugins')({
  pattern: ['gulp-*', 'del']
});

module.exports = function(options) {
  gulp.task('css', ['styles'], function () {
    return gulp.src(options.tmp + '/serve/lindat-common.css')
      .pipe($.replace('images/', '../images/'))
      .pipe($.rename('lindat.css'))
      .pipe(gulp.dest(options.public + '/css/'))
      .pipe($.csso(true /* structureMinimization: true */))
      .pipe($.rename('lindat.min.css'))
      .pipe(gulp.dest(options.public + '/css/'));
  });

  gulp.task('html', ['preprocess'], function () {
    return gulp.src(options.tmp + '/serve/partials/*.html')
      .pipe($.minifyHtml({
        empty: true,
        spare: true,
        quotes: true,
        conditionals: true
      }))
      .pipe(gulp.dest(options.dist + '/'));
  });

  gulp.task('angular:templates', ['preprocess'], function () {
    return gulp.src([
      options.tmp + '/serve-angular/partials/*.html'
    ])
      .pipe($.minifyHtml({
        empty: true,
        spare: true,
        quotes: true
      }))
      .pipe($.angularTemplatecache('templateCacheHtml.js', {
        module: 'lindat',
        standalone: false
      }))
      .pipe(gulp.dest(options.tmp + '/serve/scripts/'));
  });

  gulp.task('angular:scripts', ['scripts', 'angular:templates'], function () {
   return gulp.src([
     options.src + '/scripts/*.js',
     options.tmp + '/serve/scripts/templateCacheHtml.js'
    ])
     .pipe($.angularFilesort()).on('error', options.errorHandler('AngularFilesort'))
     .pipe($.ngAnnotate())
     .pipe($.concat('angular-lindat.js'))
     .pipe($.wrap(options.iifeTemplate))
     .pipe(gulp.dest(options.public + '/js/'))
     .pipe($.uglify()).on('error', options.errorHandler('Uglify'))
     .pipe($.rename('angular-lindat.min.js'))
     .pipe(gulp.dest(options.public + '/js/'));
  });

  gulp.task('angular', ['angular:scripts']);

  gulp.task('images', function () {
    return gulp.src([options.src + '/images/**/*.+(png|jpg|gif|jpeg)'])
      .pipe($.imageOptimization({
        optimizationLevel: 5,
        progressive: true,
        interlaced: true
      }))
      .pipe(gulp.dest(options.public + '/images/'));
  });

  gulp.task('clean', function (done) {
    $.del([options.dist + '/', options.tmp + '/'], done);
  });

  gulp.task('assemble', ['images', 'html', 'css', 'angular']);

  gulp.task('build', ['clean'], function () {
    gulp.start('assemble');
    gulp.start('angular');
  });
};