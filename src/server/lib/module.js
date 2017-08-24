import { Observable } from 'rxjs';

/*eslint no-unused-vars: "off"*/

// callbacks method for every server ModuleBase
// init async and callbacks to specific events
export class ModuleBase {

  init$() {
    return Observable.empty();
  }

  // add in all event handlers for specific module
  // for example setup io listeners with callbacks to specific act
  registerClient() {

  }

  // all of moudles are registered so it is invoked
  clientRegistered() {

  }

}
