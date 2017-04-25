// webpack advanced mechanism
import "font-awesome-sass-loader";
import "./app.scss";

import * as services from "./services";

// ------------------------------------------
// TEST SOCKETS
services.server.on$("test")
  .map(d => d + "whoa")
  .subscribe(item => {
    console.log(`Got ${item} from server!`);
  });

window.setTimeout(() => {
  services.server.status$.subscribe(status => console.log(status));
}, 3000);

// ------------------------------------------
// Auth

// ------------------------------------------
// Components

// ------------------------------------------
// Bootstrap

// all will be registered and
services.socket.connect();
