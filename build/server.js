/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 9);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = require("webpack");

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var webpack = __webpack_require__(0);
var path = __webpack_require__(11);
var ExtractTextPlugin = __webpack_require__(10);

// 3rd party vendors
var vendorModules = ["jquery", "lodash"];

// fix odity with webpack
var dirname = path.resolve("./");

function createConfig(isDebug) {
  // source-map is slower for prod, eval for development and faster
  // eval cant be used on server, becasue source-map package doesnt support it
  var devTool = isDebug ? "eval-source-map" : "source-map";

  // this plugin will take anything in entry property as vendor and output it to vendor.js and will
  // be extracted from build
  // If an array of strings is passed this is equal to invoking the plugin multiple times for each chunk name.
  var plugins = [new webpack.optimize.CommonsChunkPlugin({
    name: "vendor",
    filename: "vendor.js"
  })];

  // we will use other style loaders in production
  // applied to entries from bot to top
  var cssLoader = {
    test: /\.css$/,
    use: [{
      // Adds CSS to the DOM by injecting a <style> tag
      loader: "style-loader"
    }, {
      // The css-loader interprets @import and url() like import/require() and will resolve them.
      loader: "css-loader"
    }],
    exclude: "/node_modules/"
  };
  var sassLoader = {
    test: /\.scss$/,
    use: [{
      loader: "style-loader"
    }, {
      loader: "css-loader"
    }, {
      loader: "sass-loader"
    }]

  };

  // to be alter in future time, in array because we will add additional files if
  // in debug mode or not
  var appEntry = ["./src/client/app.js"];

  // adding minification
  if (!isDebug) {
    plugins.push(new webpack.optimize.UglifyJsPlugin());
    // extract css from js to seperate css file
    plugins.push(new ExtractTextPlugin('[name].css'));

    // rewritring loaders for production -> css to text file
    // Creates an extracting loader from an existing loader
    cssLoader.use = ExtractTextPlugin.extract({
      fallback: 'style-loader',
      //Loader(s) that should be used for converting the resource to a CSS exporting module
      use: 'css-loader'
    });

    sassLoader.use = ExtractTextPlugin.extract({
      fallback: 'style-loader',
      use: ['css-loader', 'sass-loader']
    });
    // esle in dev mode
  } else {
    // replace modules when in runtime -> injecting client.js into our app
    // and graph their dependencies into one "chunk".
    // the last one is exported
    plugins.push(new webpack.HotModuleReplacementPlugin());
    appEntry.splice(0, 0, "webpack-hot-middleware/client");
  }

  return {
    // -------------------
    // WEBPACK CONFIG OBJECT START//
    devtool: devTool,
    // using object on entry property so we can process on multiple files
    entry: {
      app: appEntry,
      // CommonsChunkPlugin will take away jquery from app entry and stack it seperate file
      vendor: vendorModules
    },
    output: {
      path: path.join(dirname, "public", "build"),
      // webpack template syntax. File will be named after entry property.
      filename: "[name].js",
      // browser will see this bundle and use it
      // every urls that webpack encounters will be re-written with /build/ in url
      // Where you uploaded your bundled files we dont need to src="path/pic.jpg", just "pic.jpg"
      publicPath: "/build/"
    },
    resolve: {
      alias: {
        // when code sees 'shared' will join with aboslute path
        shared: path.join(dirname, "src", "shared")
      }
    },
    module: {
      rules: [{
        enforce: "pre",
        test: /\.js$/,
        loader: "eslint-loader",
        exclude: "/node_modules/"
      }, {
        test: /\.js$/,
        loader: "babel-loader",
        exclude: "/node_modules/"
      },
      // url will inline files with extensions if they are smaller than limit (ex. 1024)
      // also url-loader do cache busting (name of files will be changed),
      // so it will prevent browser using cached file when we add new file

      {
        test: /\.(png|jpg|jpeg|gif|woff|tff|eot|svg|woff2)/,
        exclude: "/node_modules/",
        // to prevent web requests from goin for small files we can inline it into css
        // example unicoded 64 base images
        // file-loader will be used if output bigget than limit size
        loader: "url-loader?limit=1024"
      }, cssLoader, sassLoader]
    },
    plugins: plugins
    // ------------------ //
  };
}

module.exports = createConfig;

/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = require("chalk");

/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = require("express");

/***/ }),
/* 4 */
/***/ (function(module, exports) {

module.exports = require("http");

/***/ }),
/* 5 */
/***/ (function(module, exports) {

module.exports = require("socket.io");

/***/ }),
/* 6 */
/***/ (function(module, exports) {

module.exports = require("source-map-support/register");

/***/ }),
/* 7 */
/***/ (function(module, exports) {

module.exports = require("webpack-dev-middleware");

/***/ }),
/* 8 */
/***/ (function(module, exports) {

module.exports = require("webpack-hot-middleware");

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


__webpack_require__(6);

var _express = __webpack_require__(3);

var _express2 = _interopRequireDefault(_express);

var _http = __webpack_require__(4);

var _http2 = _interopRequireDefault(_http);

var _socket = __webpack_require__(5);

var _socket2 = _interopRequireDefault(_socket);

var _chalk = __webpack_require__(2);

var _chalk2 = _interopRequireDefault(_chalk);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// when we in dev mode we will use hotpack middleware

// Babel converts import and export declaration to CommonJS (require/module.exports)
var isDevelopment = process.env.NODE_ENV !== "production";

// -----------------------------------------
// SETUP
// linecodes where error apears
var app = (0, _express2.default)();
var server = new _http2.default.Server(app);
var io = (0, _socket2.default)(server);

// -----------------------------------------
// Client webpack
if (process.env.USE_WEBPACK === "true") {
  // used in nodemon setup for server
  // It serves the files emitted from webpack over a connect server
  var webpackMiddleware = __webpack_require__(7);
  var webpackHotMiddleware = __webpack_require__(8);
  var webpack = __webpack_require__(0);
  var clientConfig = __webpack_require__(1)(true);

  // passing a webpack init config into variable
  var compiler = webpack(clientConfig);

  // express gonna use this middleware with 2 params - webpack config and options
  // where webpack middleware gonna intercept HTTP requests from express to change it
  // No files are written to disk, it handle the files in memory so it is goin back to src
  // when there is no file in build

  app.use(webpackMiddleware(compiler, {

    publicPath: "/build",

    // just shut up with all infos
    stats: {
      colors: true,
      chunks: false,
      assets: false,
      timing: false,
      modules: false,
      hash: false,
      version: false
    }
  }));
  // hot reloading into an existing server 
  app.use(webpackHotMiddleware(compiler));
  console.log(_chalk2.default.bgRed("Using WDM! Dev Only!"));
}
// -----------------------------------------
// Configure Express
app.set("view engine", "jade");
app.use(_express2.default.static("public"));

// if not in dev it will use external css file from production build
var useExternalStyles = !isDevelopment;
app.get("/", function (req, res) {
  res.render("index", {
    useExternalStyles: useExternalStyles
  });
});
// -----------------------------------------
// Modules


// -----------------------------------------
// Socket
io.on("connection", function (socket) {
  console.log("Got connection from " + socket.request.connection.remoteAdress);
});

// -----------------------------------------
// Startup
var port = process.env.PORT || 3000;

// in future we will have a startup process
function startServer() {
  app.listen(port, function () {
    console.log("Started Server on " + port);
  });
}

startServer();

/***/ }),
/* 10 */
/***/ (function(module, exports) {

module.exports = require("extract-text-webpack-plugin");

/***/ }),
/* 11 */
/***/ (function(module, exports) {

module.exports = require("path");

/***/ })
/******/ ]);
//# sourceMappingURL=server.js.map