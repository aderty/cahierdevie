var gulp = require('gulp');

var changed = require('gulp-changed');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var minifyCSS = require('gulp-minify-css');
var clean = require('gulp-clean');

var paths = {
    scripts: ['js/*.js'],
    scriptsLibs: ['lib/**/*.js'],
  css: ['css/**/*.css'],
  //cssLibs: ['public/libs/**/*.css']
  views: ['partials/*.html'],
  index: ['index.html'],
  img: ['img/*'],
  font: ['fonts/*']
};

var DEST = '../../Android/apps/cahierdevie/platforms/android/assets/www',
DEST_CSS = DEST + '/css',
DEST_JS = DEST + '/js',
DEST_LIB = DEST + '/lib',
DEST_IMG = DEST + '/img',
DEST_VIEWS = DEST + '/partials',
DEST_FONT = DEST + '/fonts';

gulp.task('clean', function() {
  return gulp.src([DEST], { read: false })
  .pipe(clean());
});

gulp.task('scripts', function() {
  // Minify and copy all JavaScript (except vendor scripts)
    return gulp.src(paths.scripts)
    .pipe(changed(DEST_JS))
    //.pipe(uglify())
    //.pipe(concat('all.min.js'))
    .pipe(gulp.dest(DEST_JS));
});

gulp.task('scriptsLibs', function () {
    // Minify and copy all JavaScript (except vendor scripts)
    return gulp.src(paths.scriptsLibs)
    .pipe(changed(DEST_LIB))
    //.pipe(uglify())
    //.pipe(concat('all.min.js'))
    .pipe(gulp.dest(DEST_LIB));
});

gulp.task('css', function() {
    return gulp.src(paths.css)
    .pipe(changed(DEST_CSS))
    //.pipe(minifyCSS())
    //.pipe(concat('all.min.css'))
    .pipe(gulp.dest(DEST_CSS))
});

gulp.task('views', function () {
    return gulp.src(paths.views)
    .pipe(changed(DEST_VIEWS))
    .pipe(gulp.dest(DEST_VIEWS))
});

gulp.task('img', function() {
    return gulp.src(paths.img)
    .pipe(changed(DEST_IMG))
    .pipe(gulp.dest(DEST_IMG))
});

gulp.task('font', function() {
    return gulp.src(paths.font)
    .pipe(changed(DEST_FONT))
    .pipe(gulp.dest(DEST_FONT))
});

gulp.task('index', function () {
    return gulp.src(paths.index)
    .pipe(changed(DEST))
    .pipe(gulp.dest(DEST))
});

// Rerun the task when a file changes
gulp.task('watch', function() {
  gulp.watch(paths.scripts, ['scripts']);
  gulp.watch(paths.scriptsLibs, ['scriptsLibs']);
  gulp.watch(paths.css, ['css']);
  gulp.watch(paths.views, ['views']);
  gulp.watch(paths.img, ['img']);
  gulp.watch(paths.font['font']);
  gulp.watch(paths.cssPrint, ['index']);
});

// The default task (called when you run `gulp` from cli)
gulp.task('default', ['scripts',
                      'scriptsLibs',
                      'css',
                      'views',
                      'font',
                      'index',
                      'watch']);
                      