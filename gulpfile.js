var gulp = require("gulp"),
    gutil = require("gulp-util"),
    browserify = require("gulp-browserify"),
    uglify = require("gulp-uglify"),
    jasmine = require("gulp-jasmine");

gulp.task("scripts", function() {
    return gulp.src(["src/*.js"])
               .pipe(browserify())
               .pipe(uglify())
               .pipe(gulp.dest("dist"));
});

gulp.task("test", function() {
    return gulp.src(["test/*.js"])
               .pipe(browserify())
               .pipe(jasmine());
});

gulp.task("watch", function() {
    gulp.watch("src/*.js", ["scripts", "test"]);
    gulp.watch("test/*.js", ["test"]);
});

gulp.task("default", ["scripts", "test"]);