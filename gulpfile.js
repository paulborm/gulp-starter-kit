var gulp            = require('gulp');
var plumber         = require('gulp-plumber');
var rename          = require('gulp-rename');
var autoprefixer    = require('gulp-autoprefixer');
var concat          = require('gulp-concat-util');
var uglify          = require('gulp-uglify');
var babel           = require('gulp-babel');
var imagemin        = require('gulp-imagemin');
var cache           = require('gulp-cache');
var minifycss       = require('gulp-clean-css');
var sass            = require('gulp-sass');
var nunjucks        = require('gulp-nunjucks');
var data            = require('gulp-data');
var path            = require('path');
var fs              = require('fs');
var browserSync     = require('browser-sync').create();


/*#####################################################################*/
/*#######                  INHALTSVERZEICHNIS                   #######*/
/*#####################################################################*/

//  1. Image optimisation
//  2. Styles
//  3. Scripts
//  4. Nunjucks (Templating)
//  5. Copy (From root)
//  6. Fonts
//  7. Build
//  8. Serve
//  9. Default (Build then Serve)






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
    .pipe(sass( sass().on('error', sass.logError) ))
    .pipe(autoprefixer('last 5 versions'))
    .pipe(gulp.dest('dist/styles/'))
    .pipe(rename({suffix: '.min'}))
    .pipe(minifycss())
    .pipe(gulp.dest('dist/styles/'))
    .pipe(browserSync.stream());
});


gulp.task('criticalCSS', function() {
  return gulp.src('src/styles/critical.scss')
    .pipe(sass( sass().on('error', sass.logError) ))
    .pipe(autoprefixer('last 5 versions'))
    .pipe(minifycss())
    .pipe(rename({suffix: '.min'}))
    
    .pipe(concat.header('<style type="text/css">'))
    .pipe(concat.footer('</style>'))
    .pipe(rename({
        basename: 'criticalCSS',
        extname: '.html'
      }))
      
    .pipe(gulp.dest('src/parts/'))
});

// WATCH TASK
gulp.task('criticalCSS-watch', ['criticalCSS'], function() {
  browserSync.reload();
});   




/*#####################################################################*/
/*#######                     3. SCRIPTS                        #######*/
/*#####################################################################*/

/*
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
*/

gulp.task('scripts', function(){
  return gulp.src([
    //'src/scripts/someFile.js','
  ])
    .pipe(babel({
      "presets": ["env"]
    }))
    .pipe(plumber({
      errorHandler: function (error) {
        console.log(error.message);
        this.emit('end');
    }}))
    .pipe(uglify())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('assets/js/'))
});

// WATCH TASK
gulp.task('scripts-normal-watch', ['scripts-normal'], function() {
  browserSync.reload();
}); 


gulp.task('scripts-vendor', function() {
  return gulp.src(['src/scripts/vendor/**/*.js'])
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
/*#######              3.1 SCRIPTS Global Plugins               #######*/
/*#####################################################################*/
/*
Combines globally used scripts
*/

gulp.task('scripts-vendor-global', function(){
  return gulp.src([
      'src/scripts/vendor/jquery-1.12.0.min.js'
    ])
    .pipe(plumber({
      errorHandler: function (error) {
        console.log(error.message);
        this.emit('end');
    }}))
    .pipe(concat('vendor-global.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist/scripts/vendor'))
});









/*#####################################################################*/
/*#######           4. NUNJUCKS (HTML, TEMPLATES)               #######*/
/*#####################################################################*/


gulp.task('nunjucks', function() {
    return gulp.src('src/*.html')

      // Adding data to Nunjucks 
      .pipe(data(function() {
        return JSON.parse(fs.readFileSync('./src/data/data.json'));
      }))

      /*
      .pipe(data(function() {
        return JSON.parse(fs.readFileSync('./src/data/other-data-file.json'));
      }))
      */

      .pipe(nunjucks.compile())
      .pipe(gulp.dest('dist'))
});


// WATCH TASK
gulp.task('nunjucks-watch', ['nunjucks'], function() {
  browserSync.reload();
});    

// WATCH TASK
gulp.task('data-watch', ['nunjucks'], function() {
  browserSync.reload();
});    




/*#####################################################################*/
/*#######             5. COPY (FILES FROM ROOT)                 #######*/
/*#####################################################################*/


gulp.task('copy', function() {
   gulp.src([
     './src' + '/.htaccess', 
     './src' + '/*.ico', 
     './src' + '/*.js', 
     './src' + '/*.json', 
     './src' + '/*.xml',
     './src' + '/*.txt'
     ])
   .pipe(gulp.dest('./dist'))
});

// WATCH TASK
gulp.task('copy-watch', ['copy'], function() {
  browserSync.reload();
});






/*#####################################################################*/
/*#######             6. Fonts (Copy Font Files)                #######*/
/*#####################################################################*/


gulp.task('fonts', function() {
   gulp.src(['src/fonts/**/*'])
   .pipe(gulp.dest('dist/fonts'))
});

// WATCH TASK
gulp.task('fonts-watch', ['copy'], function() {
  browserSync.reload();
});





/*#####################################################################*/
/*#######              7. BUILD (BUILD WEBSITE)                 #######*/
/*#####################################################################*/ 


gulp.task('build', ['styles', 'criticalCSS', 'nunjucks', 'scripts', 'images', 'copy']);






/*#####################################################################*/
/*#######             8. SERVE (CREATE SERVER)                  #######*/
/*#####################################################################*/


gulp.task('serve', function() {
  browserSync.init({
    ghostMode: false,
    port: "3000",
    proxy: "localhost",
    serveStatic: ["./dist"],
    serveStaticOptions: {
      extensions: ["html"]
    }
  });
  gulp.watch(['src/*.html', 'src/parts/**/*.html'], ['nunjucks-watch']);
  gulp.watch('src/data/**/*.json', ['data-watch']);
  //gulp.watch('src/styles/critical.scss', ['criticalCSS']);
  gulp.watch('src/styles/**/*.scss', ['styles', 'criticalCSS']);
  gulp.watch('src/scripts/*.js', ['scripts-normal-watch']);
  gulp.watch('src/scripts/vendor/**/*.js', ['scripts-vendor-watch']);
  gulp.watch('src/images/**/*', ['images-watch']);
  gulp.watch(['src/*.ico', 'src/.htaccess'], ['copy-watch']);
  gulp.watch(['./src' + '/.htaccess', './src' + '/*.ico', './src' + '/*.js', './src' + '/*.json', './src' + '/*.xml', './src' + '/*.txt'], ['copy-watch']);
});






/*#####################################################################*/
/*#######            9. DEFAULT - BUILD AND SERVE               #######*/
/*#####################################################################*/ 


gulp.task('default', ['build', 'serve']);


