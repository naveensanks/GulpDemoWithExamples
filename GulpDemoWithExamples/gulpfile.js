// include npm modules 
var browsersync = require('browser-sync'); // module for synchronized browser testing. Saves testing time.
var Server = require('karma').Server; // test runner for javascript 
var gulp = require('gulp'); // module for gulp
var del = require('del'); // plugin to delete files
var pkg = require('./package.json');

// include gulp plugins
var sass = require('gulp-sass'); // plugin to compile sass
var tsc = require('gulp-typescript'); // plugin to compile typescript

var jshint = require('gulp-jshint'); // JSHint plugin for gulp
var concat = require('gulp-concat'); //  gulp plugin to concatenate files.
var uglify = require('gulp-uglify'); // plugin for minification

var preprocess = require('gulp-preprocess'); // Gulp plugin to preprocess HTML, JavaScript, and other files based on custom context or environment configuration
var htmlclean = require('gulp-htmlclean'); // Cleaner to minify without changing its structure
var pleeease = require('gulp-pleeease'); // plugin to postprocess css to remove white space, comments etc.
var stripdebug = require('gulp-strip-debug'); // plugin to strip console, alert, and debugger statements from JavaScript code

var size = require('gulp-size'); // plugin to log out the total size of files in the stream and optionally the individual file-sizes

// flag for environment
// var devBuild = ((process.env.NODE_ENV || 'development').trim().toLowerCase() !== 'production');
var devBuild = true;

// variables for file locations - source and destination
var source = 'src/';
var dest = 'build/';

// javascript objects holding config information for different operations.
var html = {
    in: source + '*.html',
    watch: [source + '*.html', source + 'template/**/*'],
    out: dest,
    context: {
        devBuild: devBuild,
        author: pkg.author,
        version: pkg.version
    }
};

var images = {
    in: source + 'images/*.*',
    out: dest + 'images/'
};

var imguri = {
    in: source + 'images/inline/*',
    out: source + 'scss/images/',
    filename: '_datauri.scss',
    namespace: 'img'
};

var css = {
    in: source + 'scss/main.scss',
    watch: [source + 'scss/**/*', '!' + imguri.out + imguri.filename],
    out: dest + 'css/',
    sassOpts: {
        outputStyle: 'nested',
        imagePath: '../images',
        precision: 3,
        errLogToConsole: true
    },
    pleeeaseOpts: {
        autoprefixer: { browsers: ['last 2 versions', '> 2%'] },
        rem: ['16px'],
        pseudoElements: true,
        mqpacker: true,
        minifier: !devBuild
    }
};

var fonts = {
    in: source + 'fonts/*.*',
    out: css.out + 'fonts/'
};

var ts = {
    in: source + 'ts/*',
    out: dest + 'ts/'
};

var js = {
    in: source + 'js/*',
    out: dest + 'js/',
    filename: 'main.js'
};

var syncOpts = {
    server: {
        baseDir: dest,
        index: 'index.html'
    },
    open: false,
    notify: true
};

// show build type
console.log(pkg.name + ' ' + pkg.version + ', ' + (devBuild ? 'development' : 'production') + ' build');



// GULP tasks

// task to run test
gulp.task('test', function (done) {
    new Server({
        configFile: __dirname + '/karma.conf.js',
        singleRun: true
    }, done).start();
});

// task to clean/delete the contents of the output folder
gulp.task('clean', ['test'], function () {
    del([
      dest + '*'
    ]);
});

// task to compile Sass
gulp.task('sass', ['clean'], function () {
    return gulp.src(css.in)
      .pipe(sass(css.sassOpts))
      .pipe(pleeease(css.pleeeaseOpts))
      .pipe(gulp.dest(css.out));
});

// task to copy fonts
gulp.task('fonts', ['sass'], function () {
    del([fonts.out]);
    return gulp.src(fonts.in)
    .pipe(gulp.dest(fonts.out));
});

// task to compile typescript to javascript
gulp.task('ts', ['sass'], function () {
    del([ts.out]);
    return gulp.src(ts.in)
        .pipe(tsc({
            noImplicitAny: true
        }))
        .pipe(gulp.dest(ts.out, { overwrite: false }));
});

// task to copy javascript files (in addition to bundling and minification, if required) to destination folder
gulp.task('js', ['ts'], function () {
    if (devBuild) {
        return gulp.src([js.in, ts.out + '*'])
          .pipe(jshint())
          .pipe(jshint.reporter('default'))
          .pipe(jshint.reporter('fail'))
          .pipe(gulp.dest(js.out));
    }
    else {
        del([
          dest + 'js/*'
        ]);
        return gulp.src([js.in, ts.out + '*'])
          .pipe(size({ title: 'JS in' }))
          .pipe(concat(js.filename))
          .pipe(stripdebug())
          .pipe(uglify())
          .pipe(size({ title: 'JS out' }))
          .pipe(gulp.dest(js.out));
    }
});

// task to clean the temporary folder created for typescript compilation
gulp.task('buildJSandClean', ['js'], function () {
    del([
      ts.out
    ]);
});

// task to build HTML files
gulp.task('html', ['buildJSandClean'], function () {
    var page = gulp.src(html.in).pipe(preprocess({ context: html.context }));
    if (!devBuild) {
        page = page
          .pipe(size({ title: 'HTML in' }))
          .pipe(htmlclean())
          .pipe(size({ title: 'HTML out' }));
    }
    return page.pipe(gulp.dest(html.out));
});

// task for browser sync
gulp.task('browsersync', ['html'], function () {
    browsersync(syncOpts);
});

// default task
gulp.task('default', ['browsersync'], function () {

    // html changes
    gulp.watch(html.watch, ['html', browsersync.reload]);

    // sass and inline image changes
    gulp.watch([css.watch], ['html', browsersync.reload]);

    // typescript changes
    gulp.watch(ts.in, ['html', browsersync.reload]);

    // javascript changes
    gulp.watch(js.in, ['html', browsersync.reload]);

});
