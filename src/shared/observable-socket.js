// will be used on client and server
import {Observable} from "rxjs";


// wrapper for socket
export class ObservableSocket {

  // using as flags to determine state of app connection
  get isConnected() { return this._state.isConnected; }
  get isReconnecting() { return this._state.isReconnecting; }
  get isDead() { return !this.isConnected && !this.isReconnecting; }


  constructor(socket) {
    this._socket = socket;
    this._state = {};

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
      .publishReplay(1)
      .refCount();

    // subscribing event to state object with determined event from socket io
    // observable subscribed to observer, who assign state object to var _state
    this.status$.subscribe(state => this._state = state);
  }

  // basic wrappers

  // Creates an Observable (data) that emits events of socket io from server
  // Functions that return values over time

  // Observer
  // A grouped set of functions that handle emitted values from your observables

  // Subscription
  // A connection between an observable and an observer
  on$(event) {
    return Observable.fromEvent(this._socket, event);
  }

  on(event, callback) {
    this._socket.on(event, callback);
  }

  off(event, callback) {
    this._socket.off(event, callback);
  }

  emit(event, arg) {
    this._socket.emit(event, arg);
  }
}
