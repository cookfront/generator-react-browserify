'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var del = require('del');
<% if (includeJest) { %>
var path = require('path');
<% } %>
var source = require('vinyl-source-stream');

// styles task
gulp.task('styles', ['clean'], function () {<% if (includeSass) { %>
  return gulp.src('app/styles/*.scss')
    .pipe($.plumber())
    .pipe($.sass())<% } else { %>
  return gulp.src('app/styles/*.css')<% } %>
    .pipe($.autoprefixer({browsers: ['last 1 version']}))
    .pipe(gulp.dest('public/css'));
});

// scripts task
gulp.task('scripts', ['clean'], function () {
  return gulp.src('app/scripts/*.js')
    .pipe($.plumber())
    .pipe($.babel())
    .pipe(gulp.dest('public/js'));
});

// html task
gulp.task('html', ['styles', 'scripts'], function () {
  return gulp.src('app/**/*.html')
    .pipe($.if('*.html', $.minifyHtml({conditionals: true, loose: true})))
    .pipe(gulp.dest('public/html'));
});

gulp.task('images', ['clean'], function () {
  return gulp.src('app/images/**/*')
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest('public/images'));
});

gulp.task('fonts', ['clean'], function () {
  return gulp.src(require('main-bower-files')().concat('app/fonts/**/*'))
    .pipe($.filter('**/*.{eot,svg,ttf,woff}'))
    .pipe($.flatten())
    .pipe(gulp.dest('public/fonts'));
});

<% if (includeJade) { %>
// jade task
gulp.task('jade', function () {
  return gulp.src('app/template/*.jade')
    .pipe($.jade({ pretty: true }))
    .pipe(gulp.dest('public/html'));
});
<% } %>
<% if (includeJest) { %>
// jest task
gulp.task('jest', function () {
  var nodeModules = path.resolve('./node_modules');
  return gulp.src('app/scripts/**/__tests__')
    .pipe($.jest({
        scriptPreprocessor: nodeModules + '/gulp-jest/preprocessor.js',
        unmockedModulePathPatterns: [nodeModules + '/react']
    }));
});
<% } %>

gulp.task('extras', function () {
  return gulp.src([
    'app/*.*',
    '!app/**/*.html',
    'node_modules/apache-server-configs/dist/.htaccess'
  ], {
    dot: true
  }).pipe(gulp.dest('public'));
});

// clean task
gulp.task('clean', function (cb) {
  del('public', cb);
});

// connect task
gulp.task('connect',<% if (includeSass) { %> ['styles'<% } %>, 'scripts'], function () {
  var serveStatic = require('serve-static');
  var serveIndex = require('serve-index');
  var app = require('connect')()
    .use(require('connect-livereload')({port: 35729}))
    .use(serveStatic('public'))
    .use(serveStatic('app'))
    // paths to bower_components should be relative to the current file
    // e.g. in app/index.html you should use ../bower_components
    .use('/bower_components', serveStatic('bower_components'))
    .use(serveIndex('app'));

  require('http').createServer(app)
    .listen(9000)
    .on('listening', function () {
      console.log('Started connect web server on http://localhost:9000');
    });
});

// serve task
gulp.task('serve', ['connect', 'watch'], function () {
  require('opn')('http://localhost:9000');
});

// inject bower components
gulp.task('wiredep', function () {
  var wiredep = require('wiredep').stream;
<% if (includeSass) { %>
  gulp.src('app/styles/**/*.scss')
    .pipe(wiredep())
    .pipe(gulp.dest('app/styles'));
<% } %>
  gulp.src('app/**/*.html')
    .pipe(wiredep(<% if (includeSass && includeBootstrap) { %>{exclude: ['bootstrap-sass-official']}<% } %>))
    .pipe(gulp.dest('app'));
});

// watch task
gulp.task('watch', ['connect'], function () {
  $.livereload.listen();

  // watch for changes
  gulp.watch([
    'public/html/**/*.html',
    'public/css/**/*.css',
    'public/js/**/*.js',
    'public/images/**/*'
  ]).on('change', $.livereload.changed);

  gulp.watch('app/styles/**/*.<%= includeSass ? 'scss' : 'css' %>', ['styles']);
  gulp.watch('bower.json', ['wiredep']);

  <% if (includeJade) { %>
  // Watch .jade files
  gulp.watch('app/template/**/*.jade', ['jade', 'html']);
  <% } else { %>
  gulp.watch('app/**/*.html', ['html']);
  <% } %>

  // Watch .js files
  gulp.watch('app/scripts/**/*.js', ['scripts'<% if (includeJest) { %>, 'jest' <% } %>]);
});

// build task
gulp.task('build', ['html', 'images', 'fonts', 'extras'<% if (includeJest) { %>, 'jest' <% } %><% if (includeJade) { %>, 'jade' <% } %>], function () {
  return gulp.src('public/**/*').pipe($.size({title: 'build', gzip: true}));
});

// default task
gulp.task('default', ['clean'], function () {
  gulp.start('build');
});
