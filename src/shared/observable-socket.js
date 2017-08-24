// will be used on client and server
import {Observable, ReplaySubject} from "rxjs";

// helper functions for throwing exceptions
export function clientMessage(message) {
  const error = new Error(message);
  error.clientMessage = message;
  return error;
}

// helper function for emiting messages
export function fail(message) {
  return Observable.throw({clientMessage: message});
}

let successObservable = Observable.empty();
export function success() {
  return successObservable;
}

export class ObservableSocket {

  // using as flags to determine state of app connection
  get isConnected() { return this._state.isConnected; }
  get isReconnecting() { return this._state.isReconnecting; }
  get isDead() { return !this.isConnected && !this.isReconnecting; }

  // wrapper for socket (DI)
  constructor(socket) {
    this._socket = socket;
    this._state = {};

    // adding callbacks added to specific socket
    this._actionCallbacks = {};
    // invidual requests send to server
    this._requests = {};
    // sending request counter
    this._nextrequestId = 0;

    // combine multiple Observables into one by merging their emissions
    this.status$ = Observable.merge(
      // when this event emit map an state object, if we dont use parentesies we are declaring in return with fat arrow an function's body
      this.on$("connect").map(() => ({isConnected : true})),
      this.on$("disconnect").map(() => ({isConnected : false})),
      this.on$("reconnecting").map(attempt => ({ isConnected : true, isReconnecting : false, attempt })),
      this.on$("reconnect_failed").map(() => ({ isConnected : true, isReconnecting : false }))
    )
      // use singleton when sb subscripe to status$ event
      // publishReplay(1) tells rxjs to cache the most recent value which is perfect for single value http calls.
      // refCount() is used to keep the observable alive for as long as there are subscribers.
      // Hot and Cold Obsdervables here
      .publishReplay(1)
      .refCount();

    // subscribing event to state object with determined event from socket io
    // observable subscribed to observer, who assign state object to var _state
    this.status$.subscribe(state => this._state = state);
  }

  // BASIC WRAPERS BELOW

  // Creates an Observable (subject) that emits events of socket io from server
  // Functions that return values/object over time

  // Observer
  // A grouped set of functions that handle emitted values from your observables

  // Subscription
  // A connection between an observable and an observer called listening

  // target is socket
  on$(event) {
    let stream =  Observable.fromEvent(this._socket, event);
    return stream;
  }

  // wrapper for basic on method
  on(event, callback) {
    this._socket.on(event, callback);
  }

  off(event, callback) {
    this._socket.off(event, callback);
  }

  emit(event, arg) {
    this._socket.emit(event, arg);
  }

  // -----------------------------------------------------
  // EMIT (Client Side)
  emitAction$(action, arg) {
    //return Observable.empty();

    const id = this._nextrequestId++;

    // first register action, then when server is done with data, socket emit
    // action again and we generate data to client
    this._registerCallbacks(action);

    // RS emits to any observer all of the items that were emitted by stream
    // regardless of when the observer subscribes (observer is hot and emited history vaules)
    // in this case only latest value is emited
    const subject = this._requests[id] = new ReplaySubject(1);
    // requests = {0: ReplaySubject }
    this._socket.emit(action, arg, id);
    // emit to server so he can handle it in onAction
    return subject;
  }


  // -----------------------------------------------------

  // HELPERS

  // login (username) -> emit('login') -> server -> emit('login', {data})


  _registerCallbacks(action) {
    // register once
    if (this._actionCallbacks.hasOwnProperty(action)) {
      return;
    }

    // after register, they will listen and generate values
    this._socket.on(action, (arg, id) => {
      const request = this._popRequest(id);
      if(!request) {
        return;
      }
      // next will pass generated values to subscribed clients
      // request is a subject
      request.next(arg);
      request.complete();
    });

    this._socket.on(`${action}:fail`, (arg, id) => {
      const request = this._popRequest(id);
      if (!request) {
        return;
      }

      request.error(arg);
    });

    // register callback
    this._actionCallbacks[action] = true;
  }

  // response for the right request id sent from client
  _popRequest(id) {
    // if we didnt send request then show error
    if (!this._requests.hasOwnProperty(id)) {
      console.error(`Event with id ${id} was returned twice, or
        server didnt not send back ID!`);
      return;
    }

    const request = this._requests[id];
    delete this._requests[id];
    return request;
  }

  // returning to client an custom error message rather than
  // error stack with secure information
  _emitError(action, id, error) {
    const message = (error && error.clientMessage) || "Fatal Error";
    this._socket.emit(`${action}:fail`, {message}, id);
  }


  // -----------------------------------------------------

  // On (Server Side)
  // register multiple actions with one object
  onActions(actions) {
    for (let action in actions) {
      if (!actions.hasOwnProperty(action))
        continue;

      this.onAction(action, actions[action]);
    }
  }

  // debug from emitAction socket.emit
  // callback - what to do with receive data from client?
  onAction(action, callback) {
    this._socket.on(action, (arg, requestId) => {
      try {
        // passing emited data to callback
        const value = callback(arg);
        // value is received data - observable, object or nothing

        // no value retured from cb - no side effects
        if (!value) {
          this._socket.emit(action, null, requestId);
          return;
        }

        // if not a stream - example sync results
        if(typeof(value.subscribe) !== "function") {
          this._socket.emit(action, value, requestId);
          return;
        }

        // if a value is an observable,
        // we sub and emit next values
        let hasValue = false;
        value.subscribe({
          next: (item) => {
            // we dont want more than one item
            if (hasValue)
              throw new Error(`Action ${action} prod more than one value`);
            this._socket.emit(action, item, requestId);
            hasValue = true;
          },

          error: (error) => {
            this._emitError(action, requestId, error);
            console.error(error.stack || error );
          },

          // server completed. but didnt send data
          complete: () => {
            if (!hasValue)
              this._socket.emit(action, null, requestId);
          }
        });
      }
      catch (error) {
        if(typeof(requestId) !=="undefined")
          this._emitError(action, requestId, error);

        // most of errors have stack
        console.error(error.stack || error );
      }
    });
  }


}
