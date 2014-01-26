var gulp = require("gulp"),
    gutil = require("gulp-util"),
    browserify = require("gulp-browserify"),
    uglify = require("gulp-uglify"),
    jasmine = require("gulp-jasmine"),

    testFiles = "test/*.js",
    sourceFiles = "src/*.js";

gulp.task("scripts", ["test"], function() {
    return gulp.src(["src/index.js"])
        .pipe(browserify())
        .pipe(uglify())
        .pipe(gulp.dest("dist"));
});

gulp.task("test", function() {
    return gulp.src([testFiles])
        .pipe(jasmine());
});

gulp.task("default", ["scripts"]);