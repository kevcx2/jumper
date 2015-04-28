var gulp = require('gulp'),
  nodemon = require('gulp-nodemon'),
  livereload = require('gulp-livereload'),
  sass = require('gulp-sass'),
  series = require('stream-series'),
  inject = require('gulp-inject');

var vendorStream = gulp.src(['./vendor/js/*.js'], {read: false});

var appStream = gulp.src(['./src/js/*.js'], {read: false});

gulp.src('./views/index.ejs')
  .pipe(inject(series(vendorStream, appStream), { ignorePath: ['vendor/', 'src/']}))
  .pipe(gulp.dest('./views/'));

gulp.task('sass', function () {
  gulp.src('./src/css/*.scss')
    .pipe(sass())
    .pipe(gulp.dest('./src/css'))
    .pipe(livereload());
});

gulp.task('watch', function() {
  gulp.watch('./src/css/*.scss', ['sass']);
});

gulp.task('develop', function () {
  livereload.listen();
  nodemon({
    script: 'bin/www',
    ext: 'js ejs coffee',
  }).on('restart', function () {
    setTimeout(function () {
      livereload.changed(__dirname);
    }, 500);
  });
});

gulp.task('default', [
  'sass',
  'develop',
  'watch'
]);
