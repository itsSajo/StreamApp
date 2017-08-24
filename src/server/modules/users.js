import { ModuleBase } from "../lib/module";
import _ from "lodash";

import { Observable } from "rxjs";

import {validateLogin} from "shared/validation/users";
import {fail} from "shared/observable-socket";


const AuthContext = Symbol("AuthContext");

export class UsersModule extends ModuleBase {
  constructor(io) {
    super();
    this._io = io;
    this._userList = [];

    // who is logged in
    this._users = {};
  }


  getColorForUsername(username) {
    let hash = _.reduce(username,
      (hash, ch) => ch.charCodeAt(0) + (hash << 16) - hash, 0);

    hash = Math.abs(hash);

    // 0 - 360
    const hue = hash % 360,
    // failry saturaed so 70 added
      saturation = hash % 25 + 70,
      // thin light
      ligthness = 100 - (hash % 15 + 35);

    return `hsl(${hue}, ${saturation}%, ${ligthness}%)`;
  }

  getUserForClient(client) {
    // creating prop on connected socket client
    const auth = client[AuthContext];
    if (!auth)
      return null;

    return auth.isLoggedIn ? auth : null;
  }

  // async operation
  loginClient$(client, username) {
    // eliminate white spaces
    username = username.trim();

    const validator = validateLogin(username);

    // errors appear in array
    if (!validator.isValid)
      return validator.throw$();

    if (this._users.hasOwnProperty(username))
      return fail(`Username ${username} is already taken`);

    // AuthContext is an object with auth data (username, color, loggedin)
    const auth = client[AuthContext] || (client[AuthContext] = {});

    // a new user has empty object so it will be empty, if there is a client
    // with authcontext then this will fail
    if (auth.isLoggedIn)
      return fail("You are already logged in");

    auth.name = username;
    auth.color = this.getColorForUsername(username);
    auth.isLoggedIn = true;

    // hash by username value socket of connected client
    this._users[username] = client;

    // currently online users with auth object(username, color)
    this._userList.push(auth);

    // emit to all client
    this._io.emit("users:added", auth);
    console.log(`User ${username} logged in`);

    // returning auth data after client logged in
    return Observable.of(auth);
  }

  logoutClient(client) {
    const auth = this.getUserForClient(client);
    if (!auth)
      return;

    const index = this._userList.indexOf(auth);
    this._userList.splice(index, 1);
    delete this._users[auth.name];
    delete client[AuthContext];

    this._io.emit("users:removed", auth);
    console.log(`User ${auth.name} logged out`);
  }

  // instace of client socket (client API)
  registerClient(client) {

    // listening on server client's events and passing callbacks
    client.onActions({
      // module giving user list
      "users:list": () => {
        console.log("USER LIST SENT");
        return this._userList;
      },

      "auth:login": ({ name }) => {
        console.log("USER LOGGED IN");
        return this.loginClient$(client, name);
      },

      "auth:logout": () => {
        console.log("USER LOGGED OUT");
        this.logoutClient(client);
      },

    });

    // when socket of client (maybe he quit site) dc
    client.on("disconnect", () => {
      this.logoutClient(client);
    });
  }
}
