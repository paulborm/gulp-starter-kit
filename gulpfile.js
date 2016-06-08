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
var browserSync     = require('browser-sync').create();



/*#####################################################################*/
/*#######                  INHALTSVERZEICHNIS                   #######*/
/*#####################################################################*/

//  1. Image optimisation
//  2. Styles
//  3. Scripts
//  4. Nunjucks (Templating)
//  5. Copy (From root)
//  6. Build
//  7. Serve






/*#####################################################################*/
/*#######                 1. IMAGE OPTIMIZATION                 #######*/
/*#####################################################################*/


gulp.task('images', function(){
  gulp.src([
      'src/images/**/*.jpg', 
      'src/images/**/*.jpeg',
      'src/images/**/*.png',
      'src/images/**/*.gif',
      'src/images/**/*.svg'])
    .pipe(cache(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })))
    .pipe(gulp.dest('dist/images/'))
});

// WATCH TASK
gulp.task('images-watch', ['images'], function() {
  browserSync.reload();
}); 






/*#####################################################################*/
/*#######                  2. STYLES (SASS)                     #######*/
/*#####################################################################*/


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
    .pipe(browserSync.stream());
});






/*#####################################################################*/
/*#######                     3. SCRIPTS                        #######*/
/*#####################################################################*/


gulp.task('scripts-normal', function(){
  return gulp.src(['src/scripts/*.js'])
    .pipe(plumber({
      errorHandler: function (error) {
        console.log(error.message);
        this.emit('end');
    }}))
    .pipe(gulp.dest('dist/scripts/'))
    .pipe(uglify())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('dist/scripts/'))
});

// WATCH TASK
gulp.task('scripts-normal-watch', ['scripts-normal'], function() {
  browserSync.reload();
}); 


gulp.task('scripts-vendor', function() {
  return gulp.src(['src/scripts/vendor/vendor/**/*.js'])
    .pipe(plumber({
      errorHandler: function (error) {
        console.log(error.message);
        this.emit('end');
    }}))
    .pipe(gulp.dest('dist/scripts/vendor'))
});

// WATCH TASK
gulp.task('scripts-vendor-watch', ['scripts-vendor'], function() {
  browserSync.reload();
});  
 

gulp.task('scripts', ['scripts-normal', 'scripts-vendor']);






/*#####################################################################*/
/*#######           4. NUNJUCKS (HTML, TEMPLATES)               #######*/
/*#####################################################################*/


gulp.task('nunjucks', function() {
    return gulp.src('src/*.html')
      .pipe(nunjucks.compile())
      //.pipe(htmlPrettify({indent_char: ' ', indent_size: 4}))
      .pipe(gulp.dest('dist'))
      
      //.pipe(browserSync.reload({stream:true}))
});

// WATCH TASK
gulp.task('nunjucks-watch', ['nunjucks'], function() {
  browserSync.reload();
});    






/*#####################################################################*/
/*#######             5. COPY (FILES FROM ROOT)                 #######*/
/*#####################################################################*/


gulp.task('copy', function() {
   gulp.src(['src/*.ico', 'src/.htaccess'])
   .pipe(gulp.dest('dist'))
});

// WATCH TASK
gulp.task('copy-watch', ['copy'], function() {
  browserSync.reload();
});





/*#####################################################################*/
/*#######              6. BUILD (BUILD WEBSITE)                 #######*/
/*#####################################################################*/ 


gulp.task('build', ['nunjucks', 'styles', 'scripts', 'images', 'copy']);






/*#####################################################################*/
/*#######             7. SERVE (CREATE SERVER)                  #######*/
/*#####################################################################*/


gulp.task('serve', ['nunjucks', 'styles', 'scripts', 'images', 'copy'], function() {
  browserSync.init({
    server: {
      baseDir: "./dist/"
    }
  });
  gulp.watch(['src/*.html', 'src/parts/**/*.html'], ['nunjucks-watch']);
  gulp.watch('src/styles/**/*.scss', ['styles']);
  gulp.watch('src/scripts/*.js', ['scripts-normal-watch']);
  gulp.watch('src/scripts/vendor/**/*.js', ['scripts-vendor-watch']);
  gulp.watch('src/images/**/*', ['images-watch']);
  gulp.watch(['src/*.ico', 'src/.htaccess'], ['copy-watch']);
});
