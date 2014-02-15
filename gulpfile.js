var gulp = require("gulp"),
    gutil = require("gulp-util"),
    browserify = require("gulp-browserify"),
    uglify = require("gulp-uglify"),
    jasmine = require("gulp-jasmine"),
    istanbul = require("gulp-istanbul"),
    jshint = require("gulp-jshint"),
    gzip = require("gulp-gzip"),
    clean = require("gulp-clean"),
    git = require("gulp-git"),
    bump = require("gulp-bump"),

    srcFiles = ["src/*.js"],
    testFiles = ["test/*.js"],
    exampleFiles = ["examples/*.js"],
    buildDir = "build",
    buildFiles = [buildDir + "/*.js"],
    distDir = "dist",
    distFiles = [distDir + "/*.js"],
    exampleDistDir = "examples/dist",
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

gulp.task("clean-examples", function () {
    return gulp.src([exampleDistDir], { read: false }).pipe(clean());
});

// Coverage task
gulp.task("cover", function(cb) {
    gulp.src(srcFiles).pipe(istanbul()).on("end", cb);
});

// Test tasks
gulp.task("test", ["jshint", "clean-test"], function() {
    if(process.env.TRAVIS) {
        return gulp.run("cover", function() {
            gulp.src(testFiles)
                .pipe(jasmine())
                .pipe(istanbul.writeReports());
        });
    } else {
        return gulp.src(testFiles).pipe(jasmine());
    }
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

gulp.task("examples", ["clean-examples"], function() {
    return gulp.src(exampleFiles)
        .pipe(browserify())
        .pipe(gulp.dest(exampleDistDir));
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