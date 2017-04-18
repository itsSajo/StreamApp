// use nodemon in cmd for watching changes

var http     = require("http"),
    express  = require("express"),
    socketIo = require("socket.io")
;
// creating a reference to express object
const app = express();
// set template engine to Jade - no need to add type
app.set("view engine", "jade");


// built in middleware
app.use(express.static("./public"))

// CUSTOM MIDDLEWARES


// ROUTES
app.get("/", (req, res) => {
  res.end("Hello Test");
});

app.get("/home", (req, res) => {
  res.render("index", {title : "TITLE!"})
})

// passing object to http constructor
const server = new http.Server(app);
// attach socket to our server
const io = socketIo(server);

// socket in only one invidual, io is a broadcast to all
// receive connection
io.on("connection", socket => {
  console.log("Client connected!");
  // user created event emmiter
  // receive data
  socket.on("chat:add", data => {
    console.log(data);
    // sends data as we created emiter
    io.emit("chat:added", data)
  })
});

// server is listening
server.listen(3000, () => {
  console.log("Server started on port 3000");
});
