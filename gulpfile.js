// -------------------------------------------------------------  
// --- Gulp Settings ---
// -------------------------------------------------------------

var gulp        = require('gulp'),
    gutil       = require('gulp-util'),
    sass        = require('gulp-sass'),
    csso        = require('gulp-csso'),
    uglify      = require('gulp-uglify'),
    concat      = require('gulp-concat'),
    gzip        = require('gulp-gzip'),
    tinylr      = require('tiny-lr'),
    express     = require('express'),
    app         = express(),
    include     = require('gulp-include'),
    path        = require('path'),
    neat        = require('node-neat').includePaths,
    rename      = require('gulp-rename'),
    sourcemaps  = require('gulp-sourcemaps'),
    plumber     = require('gulp-plumber'),
    notify      = require('gulp-notify'),
    autoprefixer = require('gulp-autoprefixer'),
    server      = tinylr();

// -------------------------------------------------------------  
// --- Asset Paths src/dist/build ---
// -------------------------------------------------------------  

var paths = {
  styles: {
    src: 'scss/',
    dist: 'css/'
  },
  scripts: {
    src: 'scripts/',
    dist: 'js/'
  },
  fonts: {
    src: 'fonts/',
    dist: 'fonts/'
  }
};

// -------------------------------------------------------------  
// --- Bower File Lists for SCSS, JS, IE, FONTS, etc. ---
// -------------------------------------------------------------  

var bowerPath = 'bower_components/';

var cssFiles = [
  paths.styles.src, 
  bowerPath+'foundation/scss', 
  bowerPath+'fontawesome/scss', 
  bowerPath+'slick.js/slick/'
  ];

var jsFiles = [
  bowerPath+'jquery/dist/jquery.js', 
  bowerPath+'foundation/js/foundation.js', 
  bowerPath+'slick.js/slick/slick.js', 
  paths.scripts.src + 'app.js'
  ];

var ieFiles = [
  bowerPath+'html5shiv/dist/html5shiv.js', 
  bowerPath+'selectivizr/selectivizr.js'
  ];

var fontFiles = [
  'fonts/*',
  bowerPath + 'fontawesome/fonts/*'
  ];

// -------------------------------------------------------------  
// --- Basic Tasks ---
// -------------------------------------------------------------

gulp.task('css', function() {

  var onError = function(err) {
    notify.onError({
      title:    "Gulp",
      subtitle: "Failure!",
      message:  "Error: <%= error.message %>",
      sound:    "Beep"
    })(err);
    this.emit('end');
  };

  return gulp.src(paths.styles.src + '*.scss')
    .pipe(plumber({errorHandler: onError}))
    .pipe(sourcemaps.init())
    .pipe(sass({
      includePaths: cssFiles.concat(neat)
    }))
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(sourcemaps.write())
    .pipe( gulp.dest(paths.styles.dist) );
});

gulp.task('fonts', function() {
  return gulp.src(fontFiles)
    .pipe( gulp.dest(paths.fonts.dist));
});

gulp.task('js', function() {
  return gulp.src(jsFiles)
    .pipe( include() )
    .pipe( concat('all.js'))
    .pipe( gulp.dest(paths.scripts.dist));
});

gulp.task('ie', function() {
  return gulp.src(ieFiles)
    .pipe( gulp.dest(paths.scripts.dist + '/ie/'));
});

gulp.task('watch', function () {
  server.listen(35728, function (err) {
    if (err) {
      return console.log(err);
    }

    gulp.watch(paths.styles.src + '**/*.scss',['css']);
    gulp.watch(paths.scripts.src + '**/*.js',['js']);
    
  });
});

gulp.task('default', ['js', 'ie','css', 'fonts','watch']);

// -------------------------------------------------------------  
// --- Production Build Tasks ---
// -------------------------------------------------------------

gulp.task('css-prod', function() {
  return gulp.src(paths.styles.src + '*.scss')
    .pipe( 
      sass( { 
        includePaths: cssFiles.concat(neat),
      } ) )
    .pipe( gulp.dest(paths.styles.dist) )
    .pipe(autoprefixer({
        browsers: ['last 2 versions'],
        cascade: false
    }))
    .pipe(rename("all.min.css"))
    .pipe( csso() )
    .pipe( gulp.dest(paths.styles.dist) );
});

gulp.task('js-prod', function() {
  return gulp.src(jsFiles)
    .pipe( include() )
    .pipe( uglify() )
    .pipe( concat('all.min.js'))
    .pipe( gulp.dest(paths.scripts.dist));
});

gulp.task('fonts-prod', function() {
  return gulp.src(fontFiles)
    .pipe( gulp.dest(paths.fonts.dist));
});

gulp.task('compress-js', ['js-prod'], function() {
  return gulp.src(paths.scripts.dist + 'all.min.js')
    .pipe(gzip())
    .pipe(gulp.dest(paths.scripts.dist));
});

gulp.task('compress-css', ['css-prod'], function() {
  return gulp.src(paths.styles.dist + 'all.min.css')
    .pipe(gzip())
    .pipe(gulp.dest(paths.styles.dist));
});

gulp.task('build', ['compress-js', 'compress-css']);

