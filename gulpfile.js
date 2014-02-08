var gulp = require("gulp"),
    gutil = require("gulp-util"),
    browserify = require("gulp-browserify"),
    uglify = require("gulp-uglify"),
    jasmine = require("gulp-jasmine"),
    jshint = require("gulp-jshint"),
    gzip = require("gulp-gzip");

gulp.task("build", ["test"], function() {
    return gulp.src(["src/*.js"])
        .pipe(jshint(".jshintrc"))
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(browserify())
        .pipe(gulp.dest("build"));
});

gulp.task("dist", ["build"], function() {
    return gulp.src("build/*.js")
        .pipe(uglify())
        .pipe(gulp.dest("dist"));
});

gulp.task("compress", ["dist"], function() {
    return gulp.src("dist/*.js")
        .pipe(gzip())
        .pipe(gulp.dest("dist"));
});

gulp.task("test", function() {
    return gulp.src(["test/*.js"])
        .pipe(jasmine());
});

gulp.task("watch", ["build"], function() {
    return gulp.watch(["src/*.js", "test/*.js"], ["test"]);
});

gulp.task("default", ["watch"]);