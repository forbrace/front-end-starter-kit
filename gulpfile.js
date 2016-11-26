var gulp = require('gulp'),
    sass = require('gulp-ruby-sass'),
    base64 = require('gulp-base64'),
    imagemin = require('gulp-imagemin'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    livereload = require('gulp-livereload'),
    connect = require('gulp-connect'),
    sourcemaps = require('gulp-sourcemaps'),
    minify = require('gulp-minifier'),
    del = require('del'),
    gulpif = require('gulp-if'),
    nodemon = require('gulp-nodemon'),
    argv = require('yargs').argv,
    replace = require('gulp-replace'),
    series = require('stream-series');

var minifyOptions = {
    minify: true,
    collapseWhitespace: true,
    conservativeCollapse: true,
    minifyJS: false,
    minifyCSS: true
};

var files = {
    lib: [
        'bower_components/jquery/dist/jquery.min.js',
        'bower_components/bootstrap-sass/assets/javascripts/bootstrap.min.js'
    ],
    app: [
        'client/scripts/app.js'
    ],
    index: [
        'client/*.*'
    ],
    templates: [
        'client/scripts/**/*.html'
    ],
    fonts: [
        'client/fonts/**'
    ],
    images: [
        'client/images/**'
    ],
    html: [
        'client/**.html'
    ]
};

gulp.task('connect', function () {
    connect.server({
        root: ['public'],
        livereload: true
    });
});

gulp.task('sass', function () {
    return sass('client/stylesheets/app.scss', {
        sourcemap: true,
        lineNumbers: true
    })
        .on('error', sass.logError)
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('public/assets/css'))
        .pipe(minify(minifyOptions))
        .pipe(gulp.dest('dist/assets/css'))
        .pipe(livereload());
});

gulp.task('js:lib', function () {
    return gulp
        .src(files.lib)
        .pipe(concat('lib.js'))
        .pipe(gulp.dest('public/assets/js'))
        .pipe(gulp.dest('dist/assets/js'))
        .pipe(livereload());
});

gulp.task('js:app', function () {
    return gulp
        .on('error', console.log)
        .src(files.app)
        .pipe(concat('app.js'))
        .pipe(gulp.dest('public/assets/js'))
        .pipe(uglify({
            mangle: true,
            compress: true,
            output: {beautify: false}
        }))
        .pipe(gulp.dest('dist/assets/js'))
        .pipe(livereload());
});

gulp.task('index', function () {
    return gulp
        .src(files.index)
        .pipe(replace('<link rel="stylesheet" href="stylesheets/app.scss">', ''))
        .pipe(gulp.dest('public'))
        .pipe(minify(minifyOptions))
        .pipe(gulp.dest('dist'))
        .pipe(livereload());
});

gulp.task('html', function(){
    gulp.src(files.html)
        .pipe(replace('app.scss', 'app.css'))
        .pipe(gulp.dest('build/file.txt'));
});

gulp.task('templates', function () {
    return gulp
        .src(files.templates)
        .pipe(gulp.dest('public/assets/js'))
        .pipe(gulp.dest('dist/assets/js'))
        .pipe(livereload());
});

gulp.task('fonts', function (cb) {
    return gulp
        .src(files.fonts)
        .pipe(gulp.dest('public/assets/fonts'))
        .pipe(gulp.dest('dist/assets/fonts'))
        .pipe(livereload());
});

gulp.task('images', function (cb) {
    return gulp
        .src(files.images)
        .pipe(imagemin())
        .pipe(gulp.dest('public/assets/images'))
        .pipe(gulp.dest('dist/assets/images'))
        .pipe(livereload());
});

gulp.task('watch', function () {
    livereload.listen();
    gulp.watch('client/stylesheets/**/*.scss', gulp.parallel(['sass']));
    gulp.watch('client/scripts/**/*.js', gulp.parallel(['js:app']));
    gulp.watch('client/images/**/*', gulp.parallel(['images']));
    gulp.watch('client/scripts/**/*.html', gulp.parallel(['templates']));
    gulp.watch('client/*.html', gulp.parallel(['index']));
    gulp.watch('.start', function () {
        livereload.reload();
    });
});

gulp.task('clean', function () {
    return del(['public', 'dist']);
});

gulp.task(
    'compile',
    gulp.series(
        'clean',
        gulp.parallel(
            'sass',
            'templates',
            'js:lib',
            'js:app',
            'fonts',
            'images'
        ),
        'index'
    )
);

gulp.task('default',
    gulp.parallel(
        'connect',
        'compile',
        'watch'
    )
);
