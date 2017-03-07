var gulp      = require('gulp'),
  concat      = require('gulp-concat'),
  del         = require('del'),
  htmlreplace = require('gulp-html-replace'),
  jshint      = require('gulp-jshint'),
  open        = require('gulp-open'),
  os          = require('os'),
  rename      = require('gulp-rename'),
  scss        = require('gulp-sass'),
  livereload  = require('gulp-livereload'),
  plumber     = require('gulp-plumber'),
  uglify      = require('gulp-uglify');


var buildDir = './build/';

var browser = os.platform() === 'linux' ? 'google-chrome' : (
os.platform() === 'darwin' ? 'google chrome' : (
os.platform() === 'win32' ? 'chrome' : 'firefox'));

var htmlReplaceStrings = {
        'css': 'styles/styles.css',
        'scripts': 'scripts/scripts.js',
        'vendors': 'scripts/vendors.js'
    };

var vendorFiles = [
  'bower_components/angular/angular.js',
  'bower_components/angular-ui-router/release/angular-ui-router.js',
  'bower_components/angular-animate/angular-animate.js',
  'bower_components/angular-aria/angular-aria.js',
  'bower_components/angular-messages/angular-messages.js',
  'bower_components/angular-ui-map/ui-map.js',
  'bower_components/angular-ui-event/dist/event.js',
  'bower_components/ngstorage/ngStorage.js',
  'bower_components/angular-animate/angular-animate.js',
  'bower_components/socket.io-client/dist/socket.io.js',
  'bower_components/markerclustererplus/src/markerclusterer.js'
];

gulp.task('browse', function(){
  gulp.src('localhost')
    .pipe(open({app: browser}));
});

gulp.task('clean', function(){
  return del(buildDir, {force: true});
});

gulp.task('default', ['move', 'scss', 'scripts', 'views', 'vendor', 'images'], function(){
  gulp.src('dist/index.html')
    .pipe(plumber())
    .pipe(open({app:browser}));
});

gulp.task('images', ['clean'], function() {
  return gulp.src(['client/img/**/*'])
    .pipe(gulp.dest(buildDir + 'img/'))
});

gulp.task('lint', function() {
  return gulp.src('client/**/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('move', ['clean'], function() {
  gulp.src('client/favicon.png')
    .pipe(gulp.dest(buildDir));


 return gulp.src('client/index.html')
  .pipe(htmlreplace(htmlReplaceStrings))
  .pipe(gulp.dest(buildDir));
});

gulp.task('scss', ['clean'], function() {
  gulp.src('client/**/*.scss')
    .pipe(plumber())
    .pipe(scss())
    .pipe(concat('styles.css'))
    .pipe(gulp.dest(buildDir + 'styles/'))
    .pipe(livereload())
})

gulp.task('scripts', ['clean'], function(){
  return gulp.src([
    'client/**/*.module.js',
    'client/**/*.services.js',
    'client/**/*.controllers.js',
    'client/**/*.js'
  ])
    .pipe(concat('scripts.js'))
    .pipe(plumber())
    //.pipe(uglify())
    .pipe(gulp.dest(buildDir + 'scripts/'))
    .pipe(livereload());
})

gulp.task('views', ['clean'], function(){
  return gulp.src('client/**/*.html')
    .pipe(plumber())
    .pipe(rename({dirname: ''}))
    .pipe(gulp.dest(buildDir + 'views'))
    .pipe(livereload());

})

gulp.task('vendor', ['clean'], function(){
  return gulp.src(vendorFiles)
      .pipe(plumber())
      .pipe(concat('vendors.js'))
      //.pipe(uglify())
      .pipe(gulp.dest(buildDir + 'scripts/'));
})

gulp.task('watch', function() {
    gulp.watch('client/**/*.js', ['default']);
    gulp.watch('client/**/*.scss', ['default']);
    gulp.watch('client/**/*.html', ['default']);
});
