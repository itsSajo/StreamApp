import io from "socket.io-client";

import {ObservableSocket} from "shared/observable-socket";

// one instance of class in our app
export const socket = io();
export const server = new ObservableSocket(socket);
