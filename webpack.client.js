var webpack           = require("webpack");
var path              = require("path");
var ExtractTextPlugin = require("extract-text-webpack-plugin");

// 3rd party vendors
const vendorModules = ["jquery", "lodash"];

// fix odity with webpack
const dirname = path.resolve("./");

function createConfig(isDebug) {
  // source-map is slower for prod, eval for development and faster
  // eval cant be used on server, becasue source-map package doesnt support it
  const devTool = isDebug ? "eval-source-map" : "source-map";

  // this plugin will take anything in entry property as vendor and output it to vendor.js and will
  // be extracted from build
  // If an array of strings is passed this is equal to invoking the plugin multiple times for each chunk name.
  const plugins = [new webpack.optimize.CommonsChunkPlugin({
    name : "vendor",
    filename : "vendor.js"
  })];

  // we will use other style loaders in production
  // applied to entries from bot to top
  const cssLoader = {
    test    : /\.css$/,
    use     : [
      {
        // Adds CSS to the DOM by injecting a <style> tag
        loader  : "style-loader"
      },
      {
        // The css-loader interprets @import and url() like import/require() and will resolve them.
        loader  : "css-loader"
      }
    ],
    exclude : "/node_modules/"
  };
  const sassLoader = {
    test    : /\.scss$/,
    use     : [
      {
        loader  : "style-loader"
      },
      {
        loader  : "css-loader"
      },
      {
        loader  : "sass-loader"
      }
    ],

  };

  // to be alter in future time, in array because we will add additional files if
  // in debug mode or not
  const appEntry = ["./src/client/app.js"];

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
    devtool : devTool,
    // using object on entry property so we can process on multiple files
    entry   : {
      app : appEntry,
      // CommonsChunkPlugin will take away jquery from app entry and stack it seperate file
      vendor : vendorModules
    },
    output  : {
      path       : path.join(dirname, "public", "build"),
      // webpack template syntax. File will be named after entry property.
      filename   : "[name].js",
      // browser will see this bundle and use it
      // every urls that webpack encounters will be re-written with /build/ in url
      // Where you uploaded your bundled files we dont need to src="path/pic.jpg", just "pic.jpg"
      publicPath : "/build/"
    },
    resolve : {
      alias : {
        // when code sees 'shared' will join with aboslute path
        shared : path.join(dirname, "src", "shared")
      }
    },
    module: {
      rules: [
        {
          enforce : "pre",
          test    : /\.js$/,
          loader  : "eslint-loader",
          exclude : "/node_modules/"
        },
        {
          test    : /\.js$/,
          loader  : "babel-loader",
          exclude : "/node_modules/"
        },
        // url will inline files with extensions if they are smaller than limit (ex. 1024)
        // also url-loader do cache busting (name of files will be changed),
        // so it will prevent browser using cached file when we add new file

        {
          test    : /\.(png|jpg|jpeg|gif|woff|tff|eot|svg|woff2)/,
          exclude : "/node_modules/",
          // to prevent web requests from goin for small files we can inline it into css
          // example unicoded 64 base images
          // file-loader will be used if output bigget than limit size
          loader  : "url-loader?limit=1024"
        },
        cssLoader,
        sassLoader
      ]
    },
    plugins : plugins
    // ------------------ //
  };
}

module.exports = createConfig;
