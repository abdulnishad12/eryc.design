'use strict';

// Requires
var gulp = require('gulp'),
    pump = require('pump'),
    pug = require('gulp-pug'),
    sass = require('gulp-sass'),
    bs = require('browser-sync'),
    clean = require('gulp-clean'),
    plumber = require('gulp-plumber'),
    imagemin = require('gulp-imagemin'),
    prefix = require('gulp-autoprefixer'),
    uglify = require('gulp-uglify-es').default;

// Critical
var critical = require('critical').stream;

// BrowserSync Reload
var reload = bs.reload;

// My Paths
var srcRoot = './src/',
    buildRoot = './public/';

// Dev Files
var src = {
  js: srcRoot + 'js/',
  css: srcRoot + 'sass/',
  views: srcRoot + 'views/',
  assets: srcRoot + 'assets/',
};

// Build Files
var build = {
  js: buildRoot + 'js/',
  css: buildRoot + 'sass/',
  views: buildRoot + 'views/',
  assets: buildRoot + 'assets/',
};


/**
 * VIEW TASKS
 */

// View Task
gulp.task('views', function () {
  return gulp.src([
      src.views + '*.pug',
      src.views + 'pages/**/*.pug',
    ])
    .pipe(plumber())
    .pipe(pug({
      pretty: true
    }))
    .pipe(gulp.dest(buildRoot))
});


/**
 * SASS TASKS
 */

// Sass Task
gulp.task('sass', function () {
  return gulp.src(src.css + 'main.scss')
    .pipe(plumber())
    .pipe(sass.sync({
      outputStyle: 'nested',
      precision: 10,
      includePaths: ['.'],
    }))
    .pipe(prefix({
      browsers: [
        'last 2 versions',
        'android 4',
        'opera 12',
        'ie 10',
        'Firefox > 20',
        'iOS 7',
        'unreleased versions',
      ]
    }))
    .pipe(gulp.dest(build.css))
    .pipe(reload({
      stream: true
    }));
});


/**
 * WATCHER TASKS
 */

// JS Task
gulp.task('js', function (cb) {
  pump([
    gulp.src(src.js + '*.js'),
    uglify(),
    gulp.dest(build.js)
  ],
    cb
  );
});


/**
 * ASSETS
 */

// Move files
gulp.task('move', function () {
  return gulp.src([
    srcRoot + '*.ico',
    src.assets + 'favicon/*',
  ])
    .pipe(gulp.dest(buildRoot))
});

gulp.task('fonts', function () {
  return gulp.src(src.assets + 'fonts/**/*')
    .pipe(gulp.dest(buildRoot + 'fonts/'))
});

// IMG Assets
gulp.task('img', function () {
  return gulp.src(src.assets + 'img/**/**/*')
    .pipe(imagemin([
      imagemin.gifsicle({
        interlaced: true
      }),
      imagemin.jpegtran({
        progressive: true
      }),
      imagemin.optipng({
        optimizationLevel: 0
      }),
      imagemin.svgo({
        plugins: [{
          removeViewBox: true
        }]
      })
    ]))
    .pipe(gulp.dest(build.img))
    .pipe(reload({
      stream: true
    }));
});

/**
 * WATCHER TASKS
 */

// Watch views
gulp.task('watch_views', ['views'], reload);

// Watch all files
gulp.task('watch', function () {
  bs({
    server: buildRoot,
    files: [srcRoot + '**/**/**/**/*', buildRoot + '**/**/**/**/*'],
  });

  gulp.watch(srcRoot + '**/**/**/*.pug', ['watch_views']);
  gulp.watch(src.css + '**/**/*.scss', ['sass']);
  gulp.watch(src.js + '**/**/*.js', ['js']);
  gulp.watch(src.assets + 'img/**/**', ['img']);
});

// Clean Build Folder
gulp.task('clean', function () {
  return gulp.src(buildRoot)
    .pipe(clean());
});


/**
 * DEV TASK
 */
gulp.task('dev', ['views', 'videos', 'sass', 'cssLibs', 'js', 'move', 'fonts', 'img', 'watch']);





/**
 * 
 * BUILD TASKS
 * 
 */

gulp.task('build', ['ship_critical', 'js', 'img', 'move', 'fonts']);

// View Task
gulp.task('build_views', function () {
  return gulp.src([
    src.views + '*.pug',
    src.views + 'pages/**/*.pug',
  ])
    .pipe(plumber())
    .pipe(pug({
      doctype: 'html',
      pretty: false
    }))
    .pipe(gulp.dest(buildRoot))
});

// Sass Task
gulp.task('build_sass', function () {
  return gulp.src(src.css + 'main.scss')
    .pipe(plumber())
    .pipe(sass.sync({
      outputStyle: 'compressed',
      precision: 10,
      includePaths: ['.'],
    }))
    .pipe(prefix({
      browsers: [
        'last 4 versions',
        'android 4',
        'opera 12',
        'ie 10',
        'Firefox > 20',
        'iOS 7',
        'unreleased versions',
      ]
    }))
    .pipe(gulp.dest(build.css));
});

// IMG Assets
gulp.task('build_img', function () {
  return gulp.src(src.assets + 'img/**/**/*')
    .pipe(imagemin([
      imagemin.gifsicle({
        interlaced: true,
        optimizationLevel: 3
      }),
      imagemin.jpegtran({
        progressive: true
      }),
      imagemin.optipng({
        optimizationLevel: 3
      }),
      imagemin.svgo({
        plugins: [{
          removeViewBox: true,
          removeComments: true,
          removeMetadata: true,
          removeTitle: true,
          removeDesc: true,
          cleanupAttrs: true
        }]
      })
    ], {
        verbose: true
      }))
    .pipe(gulp.dest(build.img));
});

/**
 * 
 * CRITICAL CSS
 * 
 */

// Generate & Inline Critical-path CSS
gulp.task('views_critical', ['build_views', 'build_sass'], function () {
  return gulp.src(buildRoot + '*.html')
    .pipe(critical({
      base: 'public/',
      inline: true,
      css: ['public/css/main.css']
    }))
    .pipe(gulp.dest('public'));
});

// // Generate & Inline Critical-path CSS
// gulp.task('video_critical', ['build_videos', 'views_critical'], function () {
//   return gulp.src(buildRoot + '**/**/*.html')
//     .pipe(critical({
//       base: buildRoot + '**/**/*.html',
//       inline: true,
//       css: ['public/css/main.css']
//     }))
//     .pipe(gulp.dest(buildRoot));
// });

// gulp.task('ship_critical', ['video_critical']);
gulp.task('ship_critical', ['views_critical']);