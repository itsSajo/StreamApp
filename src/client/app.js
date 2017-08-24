import $ from "jquery";

import "shared/operators";

// webpack advanced mechanism
import "font-awesome-sass-loader";
import "./app.scss";

// microservices
import * as services from "./services";

// ------------------------------------------
// TEST

// ------------------------------------------
// Auth


// using the currenct logged in user from stream, we can manipulate DOM
const $html = $('html');
services.usersStore.currentUser$.subscribe(user => {
  if (user.isLoggedIn) {
    $html.removeClass("not-logged-in");
    $html.addClass("logged-in");
  } else {
    $html.addClass("not-logged-in");
    $html.removeClass("logged-in");
  }
});

// ------------------------------------------
// Components
require("./components/player/player");
require("./components/users/users");
require("./components/chat/chat");
require("./components/playlist/playlist");


// ------------------------------------------
// Bootstrap

// connectcing to service socket
services.socket.connect();
