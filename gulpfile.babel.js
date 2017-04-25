// gulp has a support for babel, so we can instruct gulp to use ES6 features!

import gulp from "gulp";
import webpack from "webpack";
import chalk from "chalk";
import rimraf from "rimraf";
import createServerConfig  from "./webpack.server"; // importing ConfigFile
import createClientConfig  from "./webpack.client";

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

// main development task
gulp.task("dev:server", gulp.series("clean:server", devServerBuild));
gulp.task("dev", gulp
  .series(
    "clean",
    devServerBuild,
    gulp.parallel(devServerWatch, devServerReload)
  ));

// expose private methods to tasks
gulp.task("prod:server", gulp.series("clean:server", prodServerBuild));
gulp.task("prod:client", gulp.series("clean:client", prodClientBuild));
gulp.task("prod", gulp.series("clean", gulp.parallel(prodServerBuild, prodClientBuild)));
////////////// PRIVATE CLIENT TASK //////////////////

function prodClientBuild(callback) {
  const compiler = webpack(createClientConfig(false));
  compiler.run((err, stats) => {
    outputWebpack("Prod:Client", err, stats);
    callback();
  });
}

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

// no callback, becasue we dont want to terminate this
// watch server.js file and recompile server whenever changes occurs
function devServerWatch() {
  devServerWebpack.watch({}, (error, stats) => {
    outputWebpack("Dev:Server", error, stats);
  });
}

// watch build folder if any changes occurs
function devServerReload() {
  return $.nodemon({
    // executing node file when changes in build folder ocurrs
    script  : "./build/server.js",
    watch   : "./build",
    // passing into script enviroment variables after reload
    env     : {
      // configure enviroment process when starting/restarting server
      "NODE_ENV"    : "development",
      // used in development enviroment - not yet know what this does exactly
      "USE_WEBPACK" : "true"
    }
  });
}

function prodServerBuild(callback) {
  prodServerWebpack.run((error, stats) => {
    outputWebpack("Prod:Server", error, stats);
    callback();
  });
}

// HELPERS

// showing webpack info about process in  terminal
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
