import { Observable } from "rxjs";
import _ from 'lodash';
import {validateLogin } from "shared/validation/users";

// users manipulation notify class. Connector beetween data and view
export class UsersStore {

  get currentUser() { return this._currentUser; }
  get isLoggedIn() { return this._currentUser && this._currentUser.isLoggedIn; }

  // io server wrapper
  constructor(server) {
    this._server = server;

    // Users List

    // init state
    const defaultStore = {users: []};

    // async data from server
    const events$ = Observable.merge(
      // it will return  {0: data }
      this._server.on$("users:list").map(opList),
      this._server.on$("users:added").map(opAdd),
      this._server.on$("users:removed").map(opRemove)
    );

    this.state$ = events$
      .scan(function(lastItem, operation) {
        return operation(lastItem.state);
      }, {state: defaultStore})
      // latest state returned from Observable
      .publishReplay(1);


    this.state$.connect();


    // auth events when client login/out

    // async when client ger user data from server
    this.currentUser$ = Observable.merge(
      this._server.on$("auth:login"),
      // mapTo just reurns any value to passed argument
      this._server.on$("auth:logout").mapTo({}))
      .startWith({})
      .publishReplay(1)
      // hot shared stream so everyone can be aware of logout user
      .refCount();


    this.currentUser$.subscribe(user => this._currentUser = user);



    // when client will connect to server, server commit new server list
    this._server.on("connect", () => {
      this._server.emit("users:list");
    });
  }

  login$(name) {
    // return array with errors
    const validator = validateLogin(name);
    if (validator.hasErrors)
      return Observable.throw({message: validator.message});

    // emiting to server so onActions can intercept data from store
    return this._server.emitAction$("auth:login", {name});
  }

  logout$() {
    return this._server.emitAction$("auth:logout");
  }
}

// REDUCERS
function opList(users) {
  return state => {

    state.users = users;
    state.users.sort((l, r) => l.name.localeCompare(r.name));
    return {
      type: "list",
      state: state
    };
  };
}

function opAdd(user) {

  return state => {
    // first param is array, second invoked fun per iteration
    let insertIndex = _.findIndex(state.users,
      u => u.name.localeCompare(user.name) > 0);


      // with new user should be always -1
    if (insertIndex === -1)
      insertIndex = state.users.length;

    // deleting old or adding at end new user object to state
    state.users.splice(insertIndex, 0, user);

    return {
      type: "add",
      user: user,
      state: state
    };
  };
}

function opRemove(user) {
  return state => {
    const index = _.findIndex(state.users, { name: user.name });
    if (index !== -1) {
      state.users.splice(index, 1);
    }

    return {
      type: "remove",
      user: user,
      state: state
    };
  };
}
