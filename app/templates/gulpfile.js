'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();

<% if (includeJest) { %>
var path = require('path');
<% } %>

var browserify = require('browserify');
var source = require('vinyl-source-stream');

gulp.task('styles', function () {<% if (includeSass) { %>
  return gulp.src('app/styles/main.scss')
    .pipe($.plumber())
    .pipe($.rubySass({
      style: 'expanded',
      precision: 10
    }))<% } else { %>
  return gulp.src('app/styles/main.css')<% } %>
    .pipe($.autoprefixer({browsers: ['last 1 version']}))
    .pipe(gulp.dest('.tmp/styles'));
});

gulp.task('jshint', function () {
  return gulp.src(['./app/scripts/*.js', './app/scripts/*.jsx'])
    .pipe($.react())
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.jshint.reporter('fail'));
});

gulp.task('scripts', function () {
  return browserify('./app/scripts/app.js')
    .bundle()
    .pipe(source('app.js'))
    .pipe(gulp.dest('.tmp/scripts'));
});

gulp.task('html', ['styles', 'scripts'], function () {<% if (includeBootstrap && includeSass) { %>
  var lazypipe = require('lazypipe');
  var cssChannel = lazypipe()
    .pipe($.csso)
    .pipe($.replace, 'bower_components/bootstrap-sass-official/assets/fonts/bootstrap','fonts');<% } %>
  var assets = $.useref.assets({searchPath: '{.tmp,app}'});

  return gulp.src('app/*.html')
    .pipe(assets)
    .pipe($.if('*.js', $.uglify()))<% if (includeBootstrap && includeSass) { %>
    .pipe($.if('*.css', cssChannel()))<% } else { %>
    .pipe($.if('*.css', $.csso()))<% } %>
    .pipe(assets.restore())
    .pipe($.useref())
    .pipe($.if('*.html', $.minifyHtml({conditionals: true, loose: true})))
    .pipe(gulp.dest('dist'));
});

gulp.task('images', function () {
  return gulp.src('app/images/**/*')
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest('dist/images'));
});

gulp.task('fonts', function () {
  return gulp.src(require('main-bower-files')().concat('app/fonts/**/*'))
    .pipe($.filter('**/*.{eot,svg,ttf,woff}'))
    .pipe($.flatten())
    .pipe(gulp.dest('dist/fonts'));
});

<% if (includeJade) { %>
gulp.task('jade', function () {
  return gulp.src('app/template/*.jade')
    .pipe($.jade({ pretty: true }))
    .pipe(gulp.dest('dist'));
});
<% } %>

<% if (includeJest) { %>
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
    '!app/*.html',
    'node_modules/apache-server-configs/dist/.htaccess'
  ], {
    dot: true
  }).pipe(gulp.dest('dist'));
});

gulp.task('clean', require('del').bind(null, ['.tmp', 'dist']));

gulp.task('connect',<% if (includeSass) { %> ['styles'<% } %>, 'scripts'] function () {
  var serveStatic = require('serve-static');
  var serveIndex = require('serve-index');
  var app = require('connect')()
    .use(require('connect-livereload')({port: 35729}))
    .use(serveStatic('.tmp'))
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

gulp.task('serve', ['connect', 'watch'], function () {
  require('opn')('http://localhost:9000');
});

// inject bower components
gulp.task('wiredep', function () {
  var wiredep = require('wiredep').stream;
<% if (includeSass) { %>
  gulp.src('app/styles/*.scss')
    .pipe(wiredep())
    .pipe(gulp.dest('app/styles'));
<% } %>
  gulp.src('app/*.html')
    .pipe(wiredep(<% if (includeSass && includeBootstrap) { %>{exclude: ['bootstrap-sass-official']}<% } %>))
    .pipe(gulp.dest('app'));
});

gulp.task('watch', ['connect'], function () {
  $.livereload.listen();

  // watch for changes
  gulp.watch([
    'app/*.html',
    '.tmp/styles/**/*.css',
    '.tmp/scripts/**/*.js',
    'app/images/**/*'
  ]).on('change', $.livereload.changed);

  gulp.watch('app/styles/**/*.<%= includeSass ? 'scss' : 'css' %>', ['styles']);
  gulp.watch('bower.json', ['wiredep']);

  <% if (includeJade) { %>
  // Watch .jade files
  gulp.watch('app/template/**/*.jade', ['jade', 'html']);
  <% } %>

  // Watch .js files
  gulp.watch('app/scripts/**/*.js', ['scripts'<% if (includeJest) { %>, 'jest' <% } %>]);
});

gulp.task('build', ['jshint', 'html', 'images', 'fonts', 'jade', 'jest', 'extras'], function () {
  return gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true}));
});

gulp.task('default', ['clean'], function () {
  gulp.start('build');
});
