// linecodes where error apears
import "source-map-support/register";
// Babel converts import and export declaration to CommonJS (require/module.exports)
import express from "express";
import http from "http";
import socketIo from "socket.io";
import chalk from "chalk";

// when we in dev mode we will use hotpack middleware
const isDevelopment = process.env.NODE_ENV !== "production";

// -----------------------------------------
// SETUP
const app = express();
const port = process.env.PORT || 3000;
const server = new http.Server(app);
const io = new socketIo(server);

// -----------------------------------------
// Client webpack
if (process.env.USE_WEBPACK === "true") {
  // used in nodemon setup for server
  // It serves the files emitted from webpack over a connect server
  var webpackMiddleware    = require("webpack-dev-middleware");
  var webpackHotMiddleware = require('webpack-hot-middleware');
  var webpack              = require("webpack");
  var clientConfig         = require("../../webpack.client")(true);

  // passing a webpack init config into variable
  const compiler = webpack(clientConfig);

  // express gonna use this middleware with 2 params - webpack config and options
  // where webpack middleware gonna intercept HTTP requests from express to change it
  // No files are written to disk, it handle the files in memory so it is goin back to src
  // when there is no file in build

  app.use(webpackMiddleware(compiler, {

    publicPath: "/build",

    // just shut up with all infos
    stats : {
      colors  : true,
      chunks  : false,
      assets  : false,
      timing  : false,
      modules : false,
      hash    : false,
      version : false
    }
  }));
  // hot reloading into an existing server
  app.use(webpackHotMiddleware(compiler));
  console.log(chalk.bgRed("Using WDM! Dev Only!"));
}
// -----------------------------------------
// Configure Express
app.set("view engine", "jade");
app.use(express.static("public"));

// if not in dev it will use external css file from production build
const useExternalStyles = !isDevelopment;
app.get("/", (req, res) => {
  res.render("index", {
    useExternalStyles
  });
});
// -----------------------------------------
// Modules



// -----------------------------------------
// Socket
io.on("connection", () => {
  console.log("User Connected");
});

// -----------------------------------------


// in future we will have a startup process
function startServer() {
  server.listen(port, () => {
    console.log(`Started Server on ${port}`);
  });
}

startServer();
