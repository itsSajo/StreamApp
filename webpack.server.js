var path          = require("path");
var nodeExternals = require('webpack-node-externals');
var webpack       = require("webpack");

function createConfig(isDebug) {
  const plugins = [];

  // if not in debug mode, then add uglifyjs
  if(!isDebug) {
    plugins.push(new webpack.optimize.UglifyJsPlugin());
  }


  return {
    // -------------------
    // WEBPACK CONFIG OBJECT

    // better output
    target    : "node",
    // in order to ignore all modules in node_modules folde
    externals : [nodeExternals()],
    // better for debuging, becasue we can see line number of error
    devtool   : "source-map",
    // all the processing on the choosen file, bundle and output it
    entry     : "./src/server/server.js",
    // output destination
    output  : {
      path      : path.join(__dirname, "build"),
      filename  : "server.js"
    },
    // moduling paths
    resolve : {
      alias : {
        // when code sees 'shared' will join with path
        shared : path.join(__dirname, "src/shared")
      }
    },
    // transform files
    module: {
      rules: [
        {
          enforce: "pre",
          test: /\.js$/,
          exclude: /node_modules/,
          loader: "eslint-loader",
        },
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: "babel-loader",
        },
      ],
    },
    // inject stuff into bundle
    plugins : plugins
    // ----------------------
  };
}

// object need to be filled with configuration
module.exports = createConfig(true);
