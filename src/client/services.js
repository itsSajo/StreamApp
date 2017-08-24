// singletons for socket and store instances

// inserting socket in build pipline to be in vendor.js
import io from "socket.io-client";
import { UsersStore } from "./stores/users";
// webpack is resolving shared folder
import {ObservableSocket} from "shared/observable-socket";

// one instance of class in our app on client side
export const socket = io({ autoConnect: false });
export const server = new ObservableSocket(socket);

export const usersStore = new UsersStore(server);
