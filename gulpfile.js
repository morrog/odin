var gulp = require("gulp"),
    gutil = require("gulp-util"),
    browserify = require("gulp-browserify"),
    uglify = require("gulp-uglify"),
    jasmine = require("gulp-jasmine"),
    coverage = require("gulp-coverage"),
    jshint = require("gulp-jshint"),
    gzip = require("gulp-gzip"),
    clean = require("gulp-clean"),
    git = require("gulp-git"),
    bump = require("gulp-bump"),

    srcFiles = ["src/*.js"],
    testFiles = ["test/*.js"],
    buildDir = "build",
    buildFiles = [buildDir + "/*.js"],
    distDir = "dist",
    distFiles = [distDir + "/*.js"],
    artifactsDir = "artifacts",
    storageDir = "test/storage";

// Pre tasks
gulp.task("jshint", function() {
    return gulp.src(srcFiles)
        .pipe(jshint(".jshintrc"))
        .pipe(jshint.reporter("jshint-stylish"));
});

gulp.task("clean-build", function () {
    return gulp.src([buildDir], { read: false }).pipe(clean());
});

gulp.task("clean-dist", function () {
    return gulp.src([distDir], { read: false }).pipe(clean());
});

gulp.task("clean-test", function () {
    return gulp.src([storageDir], { read: false }).pipe(clean());
});

// Test tasks
gulp.task("test", ["jshint", "clean-test"], function() {
    return gulp.src(testFiles)
        .pipe(coverage.instrument({ pattern: srcFiles }))
        .pipe(jasmine())
        .pipe(coverage.report({ outFile: artifactsDir + "/coverage.html" }));
});

// Build tasks
gulp.task("build", ["test", "clean-build"], function() {
    return gulp.src(srcFiles)
        .pipe(browserify())
        .pipe(gulp.dest(buildDir));
});

gulp.task("dist", ["build", "clean-dist"], function() {
    return gulp.src(buildFiles)
        .pipe(uglify())
        .pipe(gulp.dest(distDir));
});

gulp.task("compress", ["dist"], function() {
    return gulp.src(distFiles)
        .pipe(gzip())
        .pipe(gulp.dest(distDir));
});

// Util tasks
gulp.task("npm", function (done) {
    require("child_process").spawn("npm", ["publish"], { stdio: "inherit" }).on("close", done);
});

gulp.task("bump", ["test"], function () {
    return gulp.src(["./package.json"])
        .pipe(bump())
        .pipe(gulp.dest("./"));
});

gulp.task("tag", ["bump"], function () {
    var pkg = require("./package.json"),
        message = "Release v" + pkg.version;

    return gulp.src("./")
        .pipe(git.commit(message))
        .pipe(git.tag(v, message))
        .pipe(git.push("origin", "master", "--tags"))
        .pipe(gulp.dest("./"));
});

gulp.task("watch", ["build"], function() {
    return gulp.watch(srcFiles.concat(testFiles), ["test"]);
});

gulp.task("default", ["watch"]);