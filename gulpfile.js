var gulp            = require('gulp');
var plumber         = require('gulp-plumber');
var rename          = require('gulp-rename');
var autoprefixer    = require('gulp-autoprefixer');
var concat          = require('gulp-concat');
var uglify          = require('gulp-uglify');
var htmlPrettify    = require('gulp-html-prettify');
var imagemin        = require('gulp-imagemin');
var cache           = require('gulp-cache');
var minifycss       = require('gulp-minify-css');
var sass            = require('gulp-sass');
var nunjucks        = require('gulp-nunjucks');
var browserSync     = require('browser-sync');

gulp.task('browser-sync', function() {
  browserSync({
    server: {
       baseDir: "dist/"
    }
  });
});

gulp.task('bs-reload', function () {
  browserSync.reload();
});

gulp.task('images', function(){
  gulp.src('src/images/**/*')
    .pipe(cache(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })))
    .pipe(gulp.dest('dist/images/'));
});

gulp.task('styles', function(){
  gulp.src(['src/styles/**/*.scss'])
    .pipe(plumber({
      errorHandler: function (error) {
        console.log(error.message);
        this.emit('end');
    }}))
    .pipe(sass())
    .pipe(autoprefixer('last 5 versions'))
    .pipe(gulp.dest('dist/styles/'))
    .pipe(rename({suffix: '.min'}))
    .pipe(minifycss())
    .pipe(gulp.dest('dist/styles/'))
    .pipe(browserSync.reload({stream:true}))
});

gulp.task('scripts', function(){
  return gulp.src(['src/scripts/vendors/*.js', 'src/scripts/*.js'])
    .pipe(plumber({
      errorHandler: function (error) {
        console.log(error.message);
        this.emit('end');
    }}))
    
    .pipe(concat('main.js'))
    .pipe(gulp.dest('dist/scripts/'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest('dist/scripts/'))
    .pipe(browserSync.reload({stream:true}))
});

gulp.task('nunjucks', function() {
    return gulp.src('src/*.html')
    .pipe(nunjucks.compile())
    .pipe(htmlPrettify({indent_char: ' ', indent_size: 4}))
    .pipe(gulp.dest('dist'))
    
    .pipe(browserSync.reload({stream:true}))
});
    
gulp.task('copy', function() {
   gulp.src(['src/*.ico', 'src/.htaccess'])
   .pipe(gulp.dest('dist')) 
});

gulp.task('build', ['nunjucks', 'images', 'styles', 'scripts', 'copy']);

gulp.task('default', ['build', 'browser-sync'], function(){
  gulp.watch(["src/partials/**/*.html", "src/*.html"], ['nunjucks']);
  gulp.watch("src/styles/**/*.scss", ['styles']);
  gulp.watch("src/scripts/**/*.js", ['scripts']);
  gulp.watch("*.html", ['bs-reload']);
});