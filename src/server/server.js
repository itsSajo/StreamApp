// linecodes where error apears
import "source-map-support/register";
// Babel converts import and export declaration to CommonJS (require/module.exports)
import express from "express";
import http from "http";
import socketIo from "socket.io";
import chalk from "chalk";

import { Observable } from 'rxjs';

// just exe file so it will be in rx.prototype
import "shared/operators";

// shared pub/sub object for emiting and receiving emits
import {ObservableSocket } from "shared/observable-socket";

import { UsersModule } from "./modules/users";
import { PlaylistModule } from "./modules/playlist";
import { ChatModule } from "./modules/chat";

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
// Services
const videoServices = [];
const playlistRepository = {};


// -----------------------------------------
// -----------------------------------------
// Modules

// creating instances of modules and Injecting Dependency and map then to array
const users = new UsersModule(io);
const chat = new ChatModule(io, users);
const playlist = new PlaylistModule(io, users, playlistRepository, videoServices);
const modules = [users, chat, playlist];

// -----------------------------------------
// Socket
// listen on the connection event for incoming sockets (a listener for clients to connect)
io.on("connection", (socket) => {
  console.log("User Connected");

  // this will create another stream (with ) from client's emited stream with values
  // onActions will receive emit action from client side
  const client = new ObservableSocket(socket);

  // register client with all modules
  // client gets their APIs
  for(let mod of modules)
    mod.registerClient(client);

  // tell all modules client is registered
  for(let mod of modules)
    mod.clientRegistered(client);
});
// -----------------------------------------


// in future we will have a startup process
function startServer() {
  server.listen(port, () => {
    console.log(`Started Server on ${port}`);
  });
}

// merge in stream all init (observer.empty) functions
// they might be async so we use stream
Observable.merge(...modules.map(m => m.init$()))
  .subscribe({
    complete() {
      startServer();
    },

    error(error) {
      console.error(`Could not init module: ${error.stack || error}`);
    }
  });
