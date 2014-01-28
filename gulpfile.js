var gulp = require("gulp"),
    gutil = require("gulp-util"),
    browserify = require("gulp-browserify"),
    uglify = require("gulp-uglify"),
    jasmine = require("gulp-jasmine"),
    jshint = require("gulp-jshint"),

    testFiles = "test/*.js",
    sourceFiles = "src/*.js",

    jshintOptions = {
        camelcase: true,
        curly: true,
        freeze: true,
        latedef: true,
        newcap: true,
        noarg: true,
        nonbsp: true,
        undef: true,
        unused: true,
        trailing: true,
        onevar: true,
        node: true,
        browser: true,
        globals: { describe: true, it: true, expect: true, spyOn: true, jasmine: true }
    };

gulp.task("scripts", ["test"], function() {
    return gulp.src(["src/*.js"])
        .pipe(jshint(jshintOptions))
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(browserify())
        .pipe(uglify())
        .pipe(gulp.dest("dist"));
});

gulp.task("test", function() {
    return gulp.src([testFiles])
        .pipe(jshint(jshintOptions))
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(jasmine());
});

gulp.task("watch", function() {
    return gulp.watch([sourceFiles, testFiles], ["test"]);
});

gulp.task("default", ["scripts"]);