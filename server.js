// use nodemon in cmd for watching changes

var http = require("http"),
    express = require("express");

// creating a reference to express object
const app = express();
// set template engine to Jade - no need to add type
app.set("view engine", "jade");


// built in middleware
app.use(express.static("./public"))

// MIDDLEWARES
// use of function
app.use((req, res, next) => {
  console.log("In middleware 1");
  res.write("HEADER");
  // function will go through pipeline to another middleware
  next();
  console.log("Out 1");
});

// PROCESS ///

// browser -> node -> express -> m1 -> m2 -> m3 -> req handler

/////////////

app.use((req, res, next) => {
  // another middleware
  console.log("In middleware 2");
  res.write("OTHER");
  // piepline with data into request handler
  next();
  // after handler it is going to continue function' instructions
  console.log("Out 2");
});


// ROUTES
app.get("/", (req, res) => {
  res.end("Hello Test");
});

app.get("/home", (req, res) => {
  res.render("index", {title : "TITLE!"})
})

// passing object to http constructor
const server = new http.Server(app);

// server is listening
server.listen(3000, () => {
  console.log("Server started on port 3000");
});
