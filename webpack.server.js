var path          = require("path");
var nodeExternals = require('webpack-node-externals');
var webpack       = require("webpack"); // we can use built-in plugins

function createConfig(isDebug) {
  const plugins = [];

  // if not in debug mode, then add uglifyjs
  if(!isDebug) {
    plugins.push(new webpack.optimize.UglifyJsPlugin());
  }


  return {
    // -------------------
    // WEBPACK CONFIG OBJECT START//

    // using enviroment to compile (modules and stuff)
    target    : "node",
    // in order to ignore all modules in node_modules folder when bundling
    externals : [nodeExternals()],
    // for debuging purpose, we can see line of code when error apears
    devtool   : "source-map",
    // all the processing on the choosen file, bundling and output it
    entry     : "./src/server/server.js",
    // output destination path
    output  : {
      path      : path.join(__dirname, "build"),
      filename  : "server.js"
    },
    // moduling paths
    resolve : {
      alias : {
        // when code sees 'shared' will join with aboslute path
        shared : path.resolve(__dirname, "src/shared")
      }
    },
    // applied on the source code
    module: {
      // before bundling pipe it with linter and transpiler
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
    // inject stuff into bundled modules
    plugins : plugins
    // ----------------------
  };
}
  // WEBPACK CONFIG OBJECT END//

// Export function into modules

// for testing purpose -> .bin\webpack --config ./webpack.server
//module.exports = createConfig(true);

module.exports = createConfig;
