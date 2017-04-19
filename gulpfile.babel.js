// gulp has a support for babel, so we can instruct gulp to use ES6 features!

import gulp from "gulp";
import webpack from "webpack";
import chalk from "chalk";
import rimraf from "rimraf";
import createServerConfig  from "./webpack.server"; // importing ConfigFile

// IIFE returns function so we need to invoke it, so we can use an object
// with all "gulp-" plugins from package, so we dont need to import them
const $ = require("gulp-load-plugins")();

////////////// PUBLIC TASK //////////////////

// cleaning build folder and when you done invoke callback
// this built-in gulp callback signal that this task is complete
gulp.task("clean:server", callback => rimraf("./build", callback));
gulp.task("clean:client", callback => rimraf(".public/build", callback));

// parallel execution order
gulp.task("clean", gulp.parallel("clean:server", "clean:client"));

// expose private methods to tasks
gulp.task("dev:server", gulp.series("clean:server", devServerBuild));
gulp.task("prod:server", gulp.series("clean:server", prodServerBuild));

////////////// PRIVATE SERVER TASK //////////////////

// passing init webpack object config
const devServerWebpack = webpack(createServerConfig(true)),
  prodServerWebpack = webpack(createServerConfig(false))
;

// we run a function on webpack bundler above
// stats are info about the build
function devServerBuild(callback) {
  devServerWebpack.run((error, stats) => {
    outputWebpack("Dev:Server", error, stats);
    // when we dont use gulp plugin we must inform gulp when we finish by callback
    callback();
  });
}

function prodServerBuild(callback) {
  prodServerWebpack.run((error, stats) => {
    outputWebpack("Prod:Server", error, stats);
    callback();
  });
}

// HELPERS

// showing webpack info about process
function outputWebpack(label, error, stats) {

  // config/webpack related errors
  if (error)
    throw new Error(error);

  // modules related errors
  if (stats.hasErrors()) {
    $.util.log(stats.toString({ colors: true }));
  } else {
    const time = stats.endTime - stats.startTime;
    // terminal styling
    $.util.log(chalk.bgGreen(`Built ${label} in ${time} ms`));
  }

  // using gulp plugin package ot load object (show timestamps)
  //$.util.log(stats.toString());
}
